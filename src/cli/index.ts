import * as yargs from 'yargs';
import apiCommands from './api';

import '../bootstrap';

yargs.usage('Usage: $0 <command> [arguments]');

([] as yargs.CommandModule[])
    .concat(apiCommands)
    .forEach(command => yargs.command(command));

yargs.help().argv;
