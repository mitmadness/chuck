#!/usr/bin/env node
import * as yargs from 'yargs';
import allCommands from '../cli/api';

import './bootstrap';

yargs.usage('Usage: $0 <command> [arguments]');

(allCommands as yargs.CommandModule[])
    .forEach(command => yargs.command(command));

yargs.help().argv;
