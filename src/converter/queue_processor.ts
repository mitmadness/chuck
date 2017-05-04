import { IConversionJob, updateConversion } from './job';
import { IStepModule } from './steps/step';

export async function processor(steps: IStepModule[], job: IConversionJob): Promise<void> {
    //=> Set the jobId on the Conversion document
    await updateConversion(job, { 'conversion.jobId': job.jobId });

    //=> Execute all steps in order, sequentially
    for (const step of steps) {
        if (!step.shouldProcess(job)) return;

        const stepInfo = step.describe();

        //=> Set the current step name in the Conversion document
        const updateState = updateConversion(job, { 'conversion.progress.step': stepInfo.code });

        //=> Signal step change
        const signalProgress = job.progress({
            type: 'orchestrator',
            message: `Starting "${stepInfo.name}"`,
            step: stepInfo
        });

        await Promise.all([updateState, signalProgress]);

        //=> Execute the step
        await step.process(job);
    }

    //=> Mark conversion as terminated on the Conversion document
    await updateConversion(job, {
        'conversion.progress.completed': true,
        'conversion.progress.step': null
    });
}
