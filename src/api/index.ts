import * as express from 'express';
import * as raven from 'raven';
import conversionsApi from './conversions_api';
import { fatalErrorsHandler, recoverableErrorsHandler } from './middlewares';

const router: express.Router = express.Router();

//=> API endpoint roots
router.use('/conversions', conversionsApi);

//=> Install error handlers
router.use(recoverableErrorsHandler());
router.use(raven.errorHandler());
router.use(fatalErrorsHandler());

export default router;
