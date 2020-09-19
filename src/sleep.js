'use strict';

const Promise = require("bluebird");

/**
 * Delays the program execution for the given number of milliseconds.
 *
 * @param ms Halt time in milliseconds.
 */
const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

module.exports = sleep;
