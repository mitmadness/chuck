import { IConversionJob } from './job';
import { IStepModule, IStepsContext } from './steps/step';
import { processorCleanupErrorEvent, processorStepChangeEvent } from "./job_events";

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
        if (!step.shouldProcess(job, context)) continue;
        stepsStack.push(step);

        const stepInfo = step.describe();

        //=> Signal progress
        await job.progress(processorStepChangeEvent(`Starting "${stepInfo.name}"`, stepInfo));

        //=> Execute the step
        try {
            await step.process(job, context);
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
