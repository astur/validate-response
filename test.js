const test = require('ava');
const m = require('.');
const request = require('scra');

test('valid status codes', async t => {
    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m()(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m(200)(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m(200, 300)(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m([200])(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m([200, 400])(res)));
});

test('invalid status codes', async t => {
    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m(200)(res), 'Expected status code in [200] (500 found)'));

    await request('httpbin.org/status/200')
        .then(res => t.throws(() => m(400)(res), 'Expected status code in [400] (200 found)'));

    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m(200, 300, 400)(res), 'Expected status code in [200, 300, 400] (500 found)'));

    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m([200, 300, 400])(res), 'Expected status code in [200, 300, 400] (500 found)'));
});

test('response type check', t => {
    t.throws(() => m(200)({statusCode: 200}), TypeError);
});
