import * as express from 'express';
import conversionsApi from './conversions_api';
import { errorHandler, hasValidApiKey } from './middlewares';

const router = express.Router();

router.use(hasValidApiKey());

router.use('/conversions', conversionsApi);

router.use(errorHandler());

export default router;
