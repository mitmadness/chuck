import * as express from 'express';
import conversionsApi from './conversions_api';
import { errorHandler } from './middlewares';

const router: express.Router = express.Router();

router.use('/conversions', conversionsApi);

router.use(errorHandler());

export default router;
