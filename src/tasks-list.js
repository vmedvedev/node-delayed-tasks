'use strict';

const tasksList = {
    foo: (args) => {
        console.log('task: foo, arg: bar, value: %s', args.bar);
    },
    bar: (args) => {
        console.log('task: bar, arg: foo, value: %s', args.foo);
    }
};

module.exports = tasksList;
