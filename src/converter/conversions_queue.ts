import * as queue from 'bull';

const conversionsQueue = queue('chuck-conversion-queue', process.env.REDIS_PORT, process.env.REDIS_HOST);

conversionsQueue.process((job) => {
    return new Promise(resolve => setTimeout(resolve, 2000));
});

export default conversionsQueue;
