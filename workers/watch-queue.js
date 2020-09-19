'use strict';

const Redis = require("ioredis");
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const redis = new Redis(process.env.REDIS_PORT, REDIS_HOST);
const queues = require("../src/queues");
const tasksList = require("../src/tasks-list");
const Promise = require("bluebird");

/**
 * Watches given list queue by name.
 *
 * @param redis Redis client, instance of ioredis.
 * @param queue Queue name.
 * @param sleepTime Halt time in milliseconds.
 **/
const watchQueue = async (redis, queue, sleepTime) => {
    await redis.lpop('queue:' + queue)
    .then((element) => {
        if (element) {
            const item = JSON.parse(element);
            tasksList[item.name](item.args);
        }
    })
    .catch((err) => console.error(err));

    return Promise.delay(sleepTime).then(async () => await watchQueue(redis, queue, sleepTime));
};

queues.forEach((queue) => {
    watchQueue(redis, queue, 100);
});
