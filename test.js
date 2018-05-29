const test = require('ava');
const m = require('.');
const request = require('scra');

test('base', async t => {
    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m(200)(res)));
    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m(200)(res)));
    await request('httpbin.org/status/404')
        .then(res => t.throws(() => m(400)(res)));
});

test('response type check', t => {
    t.throws(() => m(200)({statusCode: 200}));
});
