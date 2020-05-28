import { IStepModule } from './steps/step';

// -- Plugin steps --
// Chuck allows to define steps outside of the main repository.
// This file contains the registry, the list of all external steps

const pluginSteps: IStepModule[] = [];

export function register(step: IStepModule): void {
    pluginSteps.push(step);
}

export function all(): IStepModule[] {
    return pluginSteps;
}
