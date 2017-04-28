import * as yargs from 'yargs';

import '../bootstrap';

yargs.usage('Usage: $0 <command> [arguments]');

([] as yargs.CommandModule[])
    .concat()
    .forEach(command => yargs.command(command));

yargs.help().argv;
