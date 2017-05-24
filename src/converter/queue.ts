import * as queue from 'bull';
import config from '../config';
import coreSteps from './steps';
import * as pluginSteps from './plugin_steps';
import { processor } from './queue_processor';
import * as handlers from './queue_event_handlers';

//=> Get plug-in steps and merge with the core steps
const steps = coreSteps.concat(pluginSteps.all());

//=> Sort all steps with their declared priority
const sortedSteps = steps.sort((a, b) => a.describe().priority - b.describe().priority);

//=> Initialize the Bull queue
const conversionsQueue = queue('chuck-conversion-queue', config.redis.port, config.redis.host);

//=> Initialize the job processor for the conversions queue
conversionsQueue.process(processor.bind(null, sortedSteps));

//=> Queue-related events
conversionsQueue.on('ready', handlers.onQueueReady);
conversionsQueue.on('paused', handlers.onQueuePaused);
conversionsQueue.on('resumed', handlers.onQueueResumed);
conversionsQueue.on('error', handlers.onQueueError);
conversionsQueue.on('cleaned', handlers.onQueueCleaned);

//=> Job-related events
conversionsQueue.on('progress', handlers.onJobProgress);
conversionsQueue.on('active', handlers.onJobActive);
conversionsQueue.on('completed', handlers.onJobCompleted);
conversionsQueue.on('failed', handlers.onJobFailed);

export default conversionsQueue;
