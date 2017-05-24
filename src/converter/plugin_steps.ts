import { IStepModule } from './steps/step';

const pluginSteps: IStepModule[] = [];

export function register(step: IStepModule): void {
    pluginSteps.push(step);
}

export function all(): IStepModule[] {
    return pluginSteps;
}
