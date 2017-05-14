import { CommandModule } from 'yargs';
import generateKeyCommand from './generate_key';
import revokeKeyCommand from './revoke_key';

export default [generateKeyCommand, revokeKeyCommand] as CommandModule[];
