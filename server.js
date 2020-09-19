'use strict';

const http = require('http');
const url = require('url');
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_PORT, REDIS_HOST);
const executeLater = require('./src/execute-later');

http.createServer(function (req, res) {
    const q = url.parse(req.url, true).query;
    const msg = q.message;

    executeLater(redis, 'foo', 'bar', {foo: msg}, 3000)
    .then((identifier) => {
        console.log("Queue item identifier: %s", identifier);
    });

    executeLater(redis, 'bar', 'foo', {bar: msg}, 3000)
    .then((identifier) => {
        console.log("Queue item identifier: %s", identifier);
    });

    res.end();
}).listen(8080);
