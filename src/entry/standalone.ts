#!/usr/bin/env node
import config from '../config';
import logger from '../logger';
import * as pluginSteps from '../converter/plugin_steps';

// -- STANDALONE MODE (part 1) --
// When using Chuck in standalone mode, we load the required plugins then we run the server in a
// separate file (part 2, ./app_standalone.ts)
// The part 2 takes care of running the server and error reporting

if (config.stepModulePlugins.length) {
    logger.info(`Loading plugins: ${config.stepModulePlugins.join(', ')}`);
}

//=> Require each plugin module buits name
config.stepModulePlugins.map(require).forEach(pluginSteps.register);

//=> Launch Chuck by its main entry point
// tslint:disable-next-line:no-var-requires
require('./app_standalone');
