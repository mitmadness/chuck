import { IConversionJob } from './job';
import { IStepModule, IStepsContext } from './steps/step';
import { processorCleanupErrorEvent, processorStepChangeEvent, processorStepProgressEvent } from './job_events';

// -- Job processor --
// Bull (the tech behind the queue) is given a function to do the actual job when it is added to the queue.
//
// We split the job in two methods:
//  1. processor: call the steps one at a time, to get the job done.
//  2. stepsCleanupProcessor: remove the temporary files when the job is done.
//
// Since there is many possible conversion, the processor is not in charge of doing the conversion.
// Instead, it delegates this task to the steps. A step is either built-in (listed in ./src/converter/steps/) or in
// a plugin.
//
// For a typical conversion, we have at least 3 steps:
//  1. One to get the file to convert
//  2. One or more to do the conversion
//  3. One to upload the result


/**
 * The processor is the function that is passed to queue.process().
 * It iterates over conversion steps, handling context and errors (cleanup, etc).
 */
export async function processor(steps: IStepModule[], job: IConversionJob): Promise<string> {
    //=> Initialize context
    const stepsStack: IStepModule[] = [];
    const context: IStepsContext = { assetsPaths: [] };
    const cleanup = stepsCleanupProcessor.bind(null, stepsStack, job, context);

    //=> Execute all steps in order, sequentially
    for (const step of steps) {
        //=> Pass or record passage
        if (!step.shouldProcess(job.data, context)) continue;
        stepsStack.push(step);

        const stepInfo = step.describe();

        //=> Signal progress
        await job.progress(processorStepChangeEvent(`Starting "${stepInfo.name}"`, stepInfo));

        //=> Function for a step to signal its progress
        function stepSignalProgress(type: string, message: string, data: any = {}) {
            return job.progress(processorStepProgressEvent(stepInfo.code, type, message, data));
        }

        //=> Execute the step
        try {
            await step.process(job.data, context, stepSignalProgress);
        } catch (err) {
            await cleanup(`An error occured while running step ${stepInfo.code}`);
            throw err;
        }
    }

    //=> Perform cleanup
    await cleanup('All steps have terminated successfuly');

    return context.assetBundleUrl as string;
}

/**
 * The cleanup processor handles conversion artifacts cleanup.
 * It is called by the processor after a successful conversion, or just after an error, before re-throw.
 * It calls each step's cleanup() method (if any).
 */
export async function stepsCleanupProcessor(
    stepsStack: IStepModule[],
    job: IConversionJob,
    context: IStepsContext,
    reason: string
): Promise<void> {
    //=> Signal cleanup
    const stepNames = stepsStack.map(step => step.describe().code).join(', ');

    await job.progress(processorStepChangeEvent(
        `Performing cleanup for steps: ${stepNames} (${reason})`,
        { code: 'cleanup', name: 'Conversion artifacts cleanup', priority: Infinity }
    ));

    //=> Call each step's cleanup() function
    while (stepsStack.length) {
        const step = stepsStack.pop() as IStepModule;
        if (!step.cleanup) continue; // implementing cleanup() isn't mandatory

        try {
            await step.cleanup(context);
        } catch (error) {
            const stepInfo = step.describe();

            await job.progress(processorCleanupErrorEvent(
                `Error during calling cleanup() of step ${stepInfo.code}, ignoring`,
                stepInfo, error
            ));
        }
    }
}
