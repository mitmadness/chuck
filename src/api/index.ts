import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import convertApi from './convert_api';

const router = express.Router();

router.use('/convert', convertApi);

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({ message: 'Fatal server error - please retry' });

    next(err);
});

export default router;
