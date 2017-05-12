import { IConversionJob, updateConversion } from './job';
import { IStepModule, IStepsContext } from './steps/step';

export async function processor(steps: IStepModule[], job: IConversionJob): Promise<void> {
    //=> Set the jobId on the Conversion document
    await updateConversion(job, { 'conversion.jobId': job.jobId });

    //=> Initialize context
    const stepsStack: IStepModule[] = [];
    const context: IStepsContext = {};
    const cleanup = stepsCleanupProcessor.bind(null, stepsStack, job, context);

    //=> Execute all steps in order, sequentially
    for (const step of steps) {
        //=> Pass or record passage
        if (!step.shouldProcess(job, context)) continue;
        stepsStack.push(step);

        //=> Signal progress
        const stepInfo = step.describe();

        await Promise.all([
            updateConversion(job, { 'conversion.progress.step': stepInfo.code }),
            job.progress({ type: 'orchestrator', message: `Starting "${stepInfo.name}"`, step: stepInfo })
        ]);

        //=> Execute the step
        try {
            await step.process(job, context);
        } catch (err) {
            await cleanup();
            throw err;
        }
    }

    //=> Perform cleanup
    await cleanup();

    //=> Mark conversion as terminated on the Conversion document
    await updateConversion(job, {
        'conversion.progress.completed': true,
        'conversion.progress.step': null
    });
}

export async function stepsCleanupProcessor(
    stepsStack: IStepModule[],
    job: IConversionJob,
    context: IStepsContext
): Promise<void> {
    //=> Signal cleanup
    const stepNames = stepsStack.map(step => step.describe().code).join(', ');

    await Promise.all([
        updateConversion(job, { 'conversion.progress.step': 'cleanup' }),
        job.progress({ type: 'orchestrator', message: `Performing general cleanup for steps ${stepNames}` })
    ]);

    //=> Call each step's cleanup() function
    while (stepsStack.length) {
        const step = stepsStack.pop() as IStepModule;
        // implementing cleanup() isn't mandatory
        if (step.cleanup) {
            await step.cleanup(context);
        }
    }
}
