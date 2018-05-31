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
    s.on('/json/good', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end('{"a":1,"b":2}');
    });
    s.on('/json/bad', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end('___');
    });
    await s.listen(1703);
    s.$200 = await request('localhost:1703/200');
    s.$500 = await request('localhost:1703/500');
    s.$GoodJSON = await request('localhost:1703/json/good');
    s.$BadJSON = await request('localhost:1703/json/bad');
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

test.after('cleanup', async () => {
    await s.close();
});
