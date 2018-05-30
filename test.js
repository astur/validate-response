const test = require('ava');
const m = require('.');
const request = require('scra');

test('no status codes', async t => {
    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m()(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m({})(res)));

    await request('httpbin.org/status/500')
        .then(res => t.notThrows(() => m()(res)));

    await request('httpbin.org/status/500')
        .then(res => t.notThrows(() => m({})(res)));
});

test('valid status codes', async t => {
    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m(200)(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m(200, 300)(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m([200])(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m([200, 300], 400)(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m('200')(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m('200,300 ,  400')(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m(['200,300', '400', 500])(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m({codes: 200})(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m({codes: '200, 300'})(res)));

    await request('httpbin.org/status/200')
        .then(res => t.notThrows(() => m({codes: [200, '300', '400, 500']})(res)));
});

test('invalid status codes', async t => {
    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m(200)(res), 'Expected status code in [200] (500 found)'));

    await request('httpbin.org/status/200')
        .then(res => t.throws(() => m(400)(res), 'Expected status code in [400] (200 found)'));

    await request('httpbin.org/status/200')
        .then(res => t.throws(() => m([300, 400], 500)(res), 'Expected status code in [300, 400, 500] (200 found)'));

    await request('httpbin.org/status/200')
        .then(res => t.throws(() => m('400')(res), 'Expected status code in [400] (200 found)'));

    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m('200, 300, 400')(res), 'Expected status code in [200, 300, 400] (500 found)'));

    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m(['100', '200 ,300', 400])(res), 'Expected status code in [100, 200, 300, 400] (500 found)'));

    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m({codes: 400})(res), 'Expected status code in [400] (500 found)'));

    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m({codes: '300, 400'})(res), 'Expected status code in [300, 400] (500 found)'));

    await request('httpbin.org/status/500')
        .then(res => t.throws(() => m({codes: ['100', '200 ,300', 400]})(res), 'Expected status code in [100, 200, 300, 400] (500 found)'));
});

test('response type check', t => {
    t.throws(() => m(200)({statusCode: 200}), TypeError);
});
