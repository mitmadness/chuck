import { IConversionJob, IOrchestratorEvent } from './job';
import { IStepModule, IStepsContext } from './steps/step';

export async function processor(steps: IStepModule[], job: IConversionJob): Promise<void> {
    //=> Initialize context
    const stepsStack: IStepModule[] = [];
    const context: IStepsContext = { assetsPaths : []};
    const cleanup = stepsCleanupProcessor.bind(null, stepsStack, job, context);
    //=> Execute all steps in order, sequentially
    for (const step of steps) {
        //=> Pass or record passage
        if (!step.shouldProcess(job, context)) continue;
        stepsStack.push(step);

        const stepInfo = step.describe();

        //=> Signal progress
        await job.progress<IOrchestratorEvent>({
            type: 'orchestrator',
            message: `Starting "${stepInfo.name}"`,
            step: stepInfo
        });

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
}

export async function stepsCleanupProcessor(
    stepsStack: IStepModule[],
    job: IConversionJob,
    context: IStepsContext,
    reason: string
): Promise<void> {
    //=> Signal cleanup
    const stepNames = stepsStack.map(step => step.describe().code).join(', ');

    await job.progress<IOrchestratorEvent>({
        type: 'orchestrator',
        message: `Performing cleanup for steps: ${stepNames} (${reason})`,
        step: { code: 'cleanup', name: 'Conversion artifacts cleanup', priority: Infinity }
    });

    //=> Call each step's cleanup() function
    while (stepsStack.length) {
        const step = stepsStack.pop() as IStepModule;
        if (step.cleanup) { // implementing cleanup() isn't mandatory
            await step.cleanup(context);
        }
    }
}
