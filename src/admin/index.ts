import * as express from 'express';
import admin from './admin.controller';

const router: express.Router = express.Router();

router.use('/', admin);

export default router;
