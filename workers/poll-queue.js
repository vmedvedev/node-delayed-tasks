'use strict';

const Redis = require("ioredis");
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const redis = new Redis(process.env.REDIS_PORT, REDIS_HOST);
const acquireLock = require("../src/acquire-lock");
const releaseLock = require("../src/release-lock");
const Promise = require("bluebird");

/**
 * Polls delayed queue.
 *
 * @param redis Redis client, instance of ioredis.
 * @param sleepTime Halt time in milliseconds.
 **/
const pollQueue = async (redis, sleepTime) => {
    let item;
    let identifier;
    let queue;

    // Get the first item in the queue.
    await redis.zrange('delayed:', 0, 0, "WITHSCORES")
    .then(async (record) => {
        if (record && record.length > 1) {
            const delay = record[1];
            item = record[0];
            if (delay <= Date.now()) {
                // Unpack the item.
                const itemObj = JSON.parse(item);
                identifier = itemObj.identifier;
                queue = itemObj.queue;
                const timeout = 10000; // 10 seconds
                // Get the lock for the item.
                return await acquireLock(redis, identifier, timeout);
            }
        }
    })
    .then(async (locked) => {
        if (locked) {
            return await redis.zrem('delayed:', item)
            .then(async (result) => {
                if (result > 0) {
                    // Move the item to the proper list queue.
                    return await redis.rpush('queue:' + queue, item);
                }
                return 0;
            })
            .then(async (result) => {
                if (result > 0) {
                    // Release the lock.
                    await releaseLock(redis, identifier, locked);
                }
            })
        }
    })
    .catch((err) => console.error(err));

    return Promise.delay(sleepTime).then(async () => await pollQueue(redis));
};

pollQueue(redis, 100);
