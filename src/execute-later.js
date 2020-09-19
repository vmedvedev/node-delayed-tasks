'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Adds task to the delayed queue.
 *
 * @param redis Redis client, instance of ioredis.
 * @param queue Queue name.
 * @param name Task name (function name).
 * @param args Arguments for task.
 * @param delay Delay of execution in milliseconds.
 * @return Unique identifier of queue item.
 **/
const executeLater = async (redis, queue, name, args, delay) => {
    // Generate a unique identifier.
    const identifier = uuidv4();
     //Prepare the item for the queue.
    const item = JSON.stringify({identifier, queue, name, args});

    if (delay > 0) {
        // Delay the item.
        await redis.zadd('delayed:', Date.now() + delay, item);
    } else {
        // Execute the item immediately.
        await redis.rpush('queue:' + queue, item);
    }

    return identifier;
};

module.exports = executeLater;
