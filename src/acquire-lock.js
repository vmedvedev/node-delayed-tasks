'use strict';

const { v4: uuidv4 } = require('uuid');
const sleep = require('./sleep');

/**
 * Acquires lock for the given lock name and timout.
 *
 * @param redis Redis client, instance of ioredis.
 * @param lockname Lock name.
 * @param timeout Timeout to wait lock in milliseconds.
 * @return Unique identifier of the lock.
 */
const acquireLock = async (redis, lockname, timeout) => {
    const identifier = uuidv4();
    const end = Date.now() + timeout;
    let isLocked = false;

    while (Date.now() < end) {
        await redis.set('lock:' + lockname, identifier, "NX")
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
