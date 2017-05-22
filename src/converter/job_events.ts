import { IStepDescription } from './steps/step';

export interface IEvent {
    type: string;
    message: string;
}

// QueueConversionStartEvent
// -------------------------

export function queueConversionStartEvent(message: string): IEvent {
    return { type: 'queue/conversion-start', message };
}

export function isQueueConversionStartEvent(event: IEvent): event is IEvent {
    return event.type == 'queue/conversion-start';
}

// QueueConversionEndedEvent
// -------------------------

export interface IQueueConversionEndedEvent extends IEvent {
    assetBundleUrl: string|null;
    error: any|null;
}

export function queueConversionEndedEvent(
    message: string,
    assetBundleUrl: string|null,
    error: any = null
): IQueueConversionEndedEvent {
    return { type: 'queue/conversion-ended', message, assetBundleUrl, error };
}

export function isQueueConversionEndedEvent(event: IEvent): event is IQueueConversionEndedEvent {
    return event.type == 'queue/conversion-ended';
}

// ProcessorStepChangeEvent
// ------------------------

export interface IProcessorStepChangeEvent extends IEvent {
    step: IStepDescription;
}

export function processorStepChangeEvent(message: string, step: IStepDescription): IProcessorStepChangeEvent {
    return { type: 'processor/step-change', message, step };
}

export function isProcessorStepChangeEvent(event: IEvent): event is IProcessorStepChangeEvent {
    return event.type == 'processor/step-change';
}

// ProcessorCleanupErrorEvent
// --------------------------

export interface IProcessorCleanupErrorEvent extends IEvent {
    step: IStepDescription;
    error: any;
}

export function processorCleanupErrorEvent(
    message: string,
    step: IStepDescription,
    error: any
): IProcessorCleanupErrorEvent {
    return { type: 'processor/cleanup-error', message, step, error };
}

export function isProcessorCleanupErrorEvent(event: IEvent): event is IProcessorCleanupErrorEvent {
    return event.type == 'processor/cleanup-error';
}

// ProcessorStepProgressEvent
// --------------------------

export interface IProcessorStepProgressEvent extends IEvent {
    [customKey: string]: any;
}

export function processorStepProgressEvent(
    stepCode: string,
    type: string,
    message: string,
    data?: any
): IProcessorStepProgressEvent {
    return { type: `processor/${stepCode}/${type}`, message, ...data };
}
