#!/usr/bin/env node
import config from '../config';
import logger from '../logger';
import * as pluginSteps from '../converter/plugin_steps';

if (config.stepModulePlugins.length) {
    logger.info(`Loading plugins: ${config.stepModulePlugins.join(', ')}`);
}

//=> Require each plugin module buits name
config.stepModulePlugins.map(require).forEach(pluginSteps.register);

//=> Launch Chuck by its main entry point
// tslint:disable-next-line:no-var-requires
require('./app_standalone');
