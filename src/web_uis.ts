import * as basicAuth from 'express-basic-auth';
import * as express from 'express';
import * as toureiro from 'toureiro';
import admin from './admin';
import config from './config';

const router: express.Router = express.Router();

// -- WEB UIs --
// 1. Admin to add/remove authentication keys
// 2. Toureiro to display jobs

//=> Set a middleware that authenticate administrators
const adminAuth = basicAuth({
    challenge: true,
    realm: 'Chuck Administration',
    users: { [config.adminWebUis.user]: config.adminWebUis.password }
});

//=> Mount Toureiro
router.use('/toureiro', adminAuth, toureiro({
    redis: { host: config.redis.host, port: config.redis.port, db: 0 }
}));

//=> Route of the admin interface
router.use('/admin', adminAuth, admin);

export default router;
