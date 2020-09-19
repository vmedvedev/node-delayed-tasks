'use strict';

const { v4: uuidv4 } = require('uuid');
const sleep = require('./sleep');

/**
 * Acquires lock for the given lock name and timout.
 *
 * @param redis Redis client, instance of ioredis.
 * @param lockname Lock name.
 * @param acquireTimeout Time to wait for lock in milliseconds.
 * @param lockTimeout Expire time for lock in milliseconds.
 * @return Unique identifier of the lock.
 */
const acquireLock = async (redis, lockname, acquireTimeout, lockTimeout) => {
    acquireTimeout = (acquireTimeout === undefined) ? 10000 : acquireTimeout;
    lockTimeout = (lockTimeout === undefined) ? 10000 : lockTimeout;
    const identifier = uuidv4();
    const end = Date.now() + acquireTimeout;
    let isLocked = false;

    while (Date.now() < end) {
        // Get the lock.
        await redis.set('lock:' + lockname, identifier, "PX", lockTimeout, "NX")
        .then((result) => {
            isLocked = (result == null) ? false : true;
        });

        if (isLocked) {
            return identifier;
        }

        // Halt for 1 second
        await sleep(1000);
    }

    return false;
};

module.exports = acquireLock;
