const test = require('ava');
const m = require('.');

test('validate-response', t => {
    t.notThrows(() => m(200)({statusCode: 200}));
    t.throws(() => m(200)({statusCode: 500}));
    t.throws(() => m(400)({statusCode: 200}));
});
