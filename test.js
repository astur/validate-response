const test = require('ava');
const m = require('.');
const request = require('scra');
const mockser = require('mockser');

let s;

test.before('setup', async () => {
    s = mockser();
    s.on('/200', (req, res) => {
        res.end('ok');
    });
    s.on('/500', (req, res) => {
        res.statusCode = 500;
        res.end('error');
    });
    await s.listen(1703);
});

test('no status codes', async t => {
    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m()(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m({})(res)));

    await request('localhost:1703/500')
        .then(res => t.notThrows(() => m()(res)));

    await request('localhost:1703/500')
        .then(res => t.notThrows(() => m({})(res)));
});

test('valid status codes', async t => {
    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m(200)(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m(200, 300)(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m([200])(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m([200, 300], 400)(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m('200')(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m('200,300 ,  400')(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m(['200,300', '400', 500])(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m({codes: 200})(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m({codes: '200, 300'})(res)));

    await request('localhost:1703/200')
        .then(res => t.notThrows(() => m({codes: [200, '300', '400, 500']})(res)));
});

test('invalid status codes', async t => {
    await request('localhost:1703/500')
        .then(res => t.throws(() => m(200)(res), 'Expected status code in [200] (500 found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m(400)(res), 'Expected status code in [400] (200 found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m([300, 400], 500)(res), 'Expected status code in [300, 400, 500] (200 found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m('400')(res), 'Expected status code in [400] (200 found)'));

    await request('localhost:1703/500')
        .then(res => t.throws(() => m('200, 300, 400')(res), 'Expected status code in [200, 300, 400] (500 found)'));

    await request('localhost:1703/500')
        .then(res => t.throws(() => m(['100', '200 ,300', 400])(res), 'Expected status code in [100, 200, 300, 400] (500 found)'));

    await request('localhost:1703/500')
        .then(res => t.throws(() => m({codes: 400})(res), 'Expected status code in [400] (500 found)'));

    await request('localhost:1703/500')
        .then(res => t.throws(() => m({codes: '300, 400'})(res), 'Expected status code in [300, 400] (500 found)'));

    await request('localhost:1703/500')
        .then(res => t.throws(() => m({codes: ['100', '200 ,300', 400]})(res), 'Expected status code in [100, 200, 300, 400] (500 found)'));
});

test('status codes check', async t => {
    await request('localhost:1703/200')
        .then(res => t.throws(() => m(1)(res), 'HTTP response code expected ("1" found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m(600)(res), 'HTTP response code expected ("600" found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m('bad')(res), 'HTTP response code expected ("bad" found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m('200, bad')(res), 'HTTP response code expected ("bad" found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m(200, 'bad', 'very bad')(res), 'HTTP response code expected ("bad" found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m(200, {codes: 200})(res), 'HTTP response code expected ("[object Object]" found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m({codes: [200, 'bad']})(res), 'HTTP response code expected ("bad" found)'));

    await request('localhost:1703/200')
        .then(res => t.throws(() => m({codes: 'bad'})(res), 'HTTP response code expected ("bad" found)'));
});

test('response type check', t => {
    t.throws(() => m(200)({statusCode: 200}), TypeError);
});

test.after('cleanup', async () => {
    await s.close();
});
