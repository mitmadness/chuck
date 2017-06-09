import * as express from 'express';
import { ApiKey } from '../models/api_key';
import { wrapAsync} from '../express_utils';

const router: express.Router = express.Router();

router.get('/', wrapAsync(async (req, res, next) => {
    const keys = await ApiKey.find({});

    res.render('admin/admin', { keys });

    next();
}));

router.post('/', wrapAsync(async (req, res, next) => {
    await ApiKey.create({});

    res.redirect('/admin');

    next();
}));

router.post('/delete/:key', wrapAsync(async (req, res, next) => {
    await ApiKey.findOneAndRemove({ key: req.params.key });

    res.redirect('/admin');

    next();
}));

export default router;
