import * as os from 'os';
import * as express from 'express';
import * as cors from 'cors';
import * as basicAuth from 'express-basic-auth';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as toureiro from 'toureiro';
import './bootstrap';
import config from '../config';
import logger, { morganStreamWriter } from '../logger';
import { connectDatabase } from '../mongoose';
import api from '../api';
import admin from '../admin';
import converterQueue from '../converter/queue';

//=> Resume the conversions queue
converterQueue.resume().catch((error) => {
    logger.error(error.message);
    process.exit(1);
});

//=> Create an Express app
const app = express();
const port = config.serverPort;

//=>Load the view engine Pug
app.set('view engine', 'pug');
app.set('views', './src/admin');

//=> Connect to the MongoDB database
connectDatabase(config.mongoUrl).catch((error) => {
    logger.error(error.message);
    process.exit(1);
});

//=> Enable CORS in dev mode so the front can reach the API
if (config.env == 'development') {
    app.use(cors());
}

//=> Logging of HTTP requests with morgan
const morganFormat = config.env == 'production'
    ? ':remote-addr - :method :url [:status], resp. :response-time ms, :res[content-length] bytes, referrer ":referrer"'
    : 'dev';

app.use(morgan(morganFormat, { stream: morganStreamWriter }));

//=> Decode JSON request bodies
app.use(
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true })
);

const auth = basicAuth({
        challenge: true,
        users: { [config.toureiro.user]: config.toureiro.password }
    });

//=> Mount Toureiro
if (config.toureiro.enable) {
    const toureiroConf = toureiro({
        redis: { host: config.redis.host, port: config.redis.port, db: 0 }
    });

    app.use('/toureiro', auth, toureiroConf);
}
//=> Mount the API
app.use('/api', api);

//=> Route of the admin interface
app.use('/admin', auth, admin);

//=> Start the HTTP server
app.listen(port, () => {
    logger.info(`🌍 Up and running @ http://${os.hostname()}:${port}`);
    logger.info(`Running for env: ${config.env}`);
});
