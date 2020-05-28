import * as express from 'express';
import * as raven from 'raven';
import conversionsApi from './conversions_api';
import { fatalErrorsHandler, recoverableErrorsHandler } from './middlewares';

const router: express.Router = express.Router();

//=> API endpoint roots
router.use('/conversions', conversionsApi);

//=> Install error handlers
// 1. Error in requests like 401, 404, etc. are not reported to devs because they are "normal" errors.
//    The middleware exits when the error is recognised as normal, and let other errors pass through
// 2. When the error is not recognised as normal (recoverable is another word for it), then it is reported to Sentry
// 3. When reported to sentry, we use yet another middleware to display the sentry response to the user
router.use(recoverableErrorsHandler());
router.use(raven.errorHandler());
router.use(fatalErrorsHandler());

export default router;
