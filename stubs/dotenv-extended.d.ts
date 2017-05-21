declare module 'dodqsdotenv-extended' {
    import { parse as dotenvParse } from 'dotenv';

    namespace DotenvExtended {
        type Path = string;

        interface IEnvironmentMap {
            [name: string]: string;
        }

        interface IDotenvExtendedOptions {
            encoding?: string;
            silent?: boolean;
            path?: Path;
            defaults?: Path;
            schema?: Path;
            errorOnMissing?: boolean;
            errorOnExtra?: boolean;
            assignToProcessEnv?: boolean;
            overrideProcessEnv?: boolean;
        }

        function load(options?: IDotenvExtendedOptions): IEnvironmentMap;

        const parse: typeof dotenvParse;
    }

    export = DotenvExtended;
}
