#!/usr/bin/env node
import * as yargs from 'yargs';
import allCommands from '../cli/api';

// -- CLI MODE --
// When using Chuck in CLI mode, we import ./boostrap to get error reporting
// but we don't start the server (that's why we don't call standalone)
import './bootstrap';

yargs.usage('Usage: $0 <command> [arguments]');

// Register all commands in src/cli/api
(allCommands as yargs.CommandModule[])
    .forEach(command => yargs.command(command));

yargs.help().argv;
