declare module 'express-basic-auth' {
    import { RequestHandler } from 'express';

    function basicAuth(options: basicAuth.IUsersOptions|basicAuth.IAuthorizerOptions): RequestHandler;

    namespace basicAuth {
        type Authorizer = (username: string, password: string) => boolean;

        type AsyncAuthorizer = (username: string, password: string, cb: (err: any, authed: boolean) => void) => void;

        interface IBaseOptions {
            challenge?: boolean;
            realm?: string;
        }

        interface IUsersOptions extends IBaseOptions {
            users: { [username: string]: string };
        }

        interface IAuthorizerOptions extends IBaseOptions {
            authorizer: Authorizer|AsyncAuthorizer;
            authorizeAsync?: boolean;
        }
    }

    export = basicAuth;
}
