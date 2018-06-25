const test = require('ava');
const m = require('.');
const request = require('scra');
const s = require('mockser')();

test.before('setup', async () => {
    s.on('/200', (req, res) => {
        res.end('ok');
    });
    s.on('/500', (req, res) => {
        res.statusCode = 500;
        res.end('error');
    });
    s.on('/json/good', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end('{"a":1,"b":2}');
    });
    s.on('/json/bad', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end('___');
    });
    s.on('/long', (req, res) => {
        res.end('___TEST___');
    });
    await s.listen(1703);
    s.$200 = await request('localhost:1703/200');
    s.$500 = await request('localhost:1703/500');
    s.$GoodJSON = await request('localhost:1703/json/good');
    s.$BadJSON = await request('localhost:1703/json/bad');
    s.$Long = await request('localhost:1703/long');
});

test('no status codes', t => {
    t.notThrows(() => m()(s.$200));
    t.notThrows(() => m({})(s.$200));
    t.notThrows(() => m()(s.$500));
    t.notThrows(() => m({})(s.$500));
});

test('valid status codes', t => {
    t.notThrows(() => m(200)(s.$200));
    t.notThrows(() => m(200, 300)(s.$200));
    t.notThrows(() => m([200])(s.$200));
    t.notThrows(() => m([200, 300], 400)(s.$200));
    t.notThrows(() => m('200')(s.$200));
    t.notThrows(() => m('200,300 ,  400')(s.$200));
    t.notThrows(() => m(['200,300', '400', 500])(s.$200));
    t.notThrows(() => m({codes: 200})(s.$200));
    t.notThrows(() => m({codes: '200, 300'})(s.$200));
    t.notThrows(() => m({codes: [200, '300', '400, 500']})(s.$200));
});

test('invalid status codes', t => {
    t.throws(() => m(200)(s.$500), 'Expected status code in [200] (500 found)');
    t.throws(() => m(400)(s.$200), 'Expected status code in [400] (200 found)');
    t.throws(() => m([300, 400], 500)(s.$200), 'Expected status code in [300, 400, 500] (200 found)');
    t.throws(() => m('400')(s.$200), 'Expected status code in [400] (200 found)');
    t.throws(() => m('200, 300, 400')(s.$500), 'Expected status code in [200, 300, 400] (500 found)');
    t.throws(() => m(['100', '200 ,300', 400])(s.$500), 'Expected status code in [100, 200, 300, 400] (500 found)');
    t.throws(() => m({codes: 400})(s.$500), 'Expected status code in [400] (500 found)');
    t.throws(() => m({codes: '300, 400'})(s.$500), 'Expected status code in [300, 400] (500 found)');
    t.throws(() => m({codes: ['100', '200 ,300', 400]})(s.$500), 'Expected status code in [100, 200, 300, 400] (500 found)');
});

test('status codes check', t => {
    t.throws(() => m(1)(s.$200), 'HTTP response code expected ("1" found)');
    t.throws(() => m(600)(s.$200), 'HTTP response code expected ("600" found)');
    t.throws(() => m('bad')(s.$200), 'HTTP response code expected ("bad" found)');
    t.throws(() => m('200, bad')(s.$200), 'HTTP response code expected ("bad" found)');
    t.throws(() => m(200, 'bad', 'very bad')(s.$200), 'HTTP response code expected ("bad" found)');
    t.throws(() => m(200, {codes: 200})(s.$200), 'HTTP response code expected ("[object Object]" found)');
    t.throws(() => m({codes: [200, 'bad']})(s.$200), 'HTTP response code expected ("bad" found)');
    t.throws(() => m({codes: 'bad'})(s.$200), 'HTTP response code expected ("bad" found)');
});

test('response type check', t => {
    t.throws(() => m(200)({statusCode: 200}), TypeError);
});

test('checkJSON', t => {
    t.notThrows(() => m({checkJSON: true})(s.$200));
    t.notThrows(() => m({checkJSON: true})(s.$GoodJSON));
    t.throws(() => m({checkJSON: true})(s.$BadJSON), 'Expected json-parsed object in body (String found)');
});

test('contentLength', t => {
    t.notThrows(() => m({contentLength: 2})(s.$200));
    t.notThrows(() => m({contentLength: [1, 3]})(s.$200));
    t.throws(() => m({contentLength: 10})(s.$200), 'Expected content length 10 (2 found)');
    t.throws(() => m({contentLength: [5, 10]})(s.$200), 'Expected content length in range 5-10 (2 found)');
    t.throws(() => m({contentLength: [0, 10]})(s.$GoodJSON), 'Expected content length in range 0-10 (13 found)');
});

test('bodyMatch', t => {
    t.notThrows(() => m({bodyMatch: /TEST/})(s.$Long));
    t.notThrows(() => m({bodyMatch: /test/i})(s.$Long));
    t.throws(() => m({bodyMatch: /TEST/})(s.$200), 'Expected body string match to /TEST/');
});

test('validator', t => {
    t.notThrows(() => m({validator: () => {}})(s.$200));
    t.throws(() => m({validator: () => 'BAH!'})(s.$200), 'Custom validator failed with message: "BAH!"');
    t.throws(() => m({
        validator: () => {
            throw new Error('BOOM!');
        },
    })(s.$200), 'Custom validator threw "Error: BOOM!"');
});

test('custom error', t => {
    const err = t.throws(() => m({
        codes: [300, 400],
        checkJSON: true,
        contentLength: 10,
        bodyMatch: /TEST/,
        validator: () => 'BAH!',
    })(s.$BadJSON), m.ValidateResponceError);
    t.is(err.message, 'Validation failed. See reasons');
    t.true(Array.isArray(err.reasons));
    t.is(err.reasons.length, 5);
    t.deepEqual(err.codes, [
        'E_INVALID_STATUS',
        'E_INVALID_JSON',
        'E_INVALID_LENGTH',
        'E_INVALID_MATCH',
        'E_INVALID_RESPONCE',
    ]);
    t.is(err.url, 'http://localhost:1703/json/bad');
    t.is(err.statusCode, 200);
    t.is(err.bodyLength, 3);
    t.deepEqual(Object.keys(err.headers), ['content-type', 'date', 'connection', 'content-length']);
});

test.after('cleanup', async () => {
    await s.close();
});
