const arfy = require('arfy');
const type = require('easytype');

module.exports = (...options) => {
    if(type.isObject(options[0])){
        options = options[0];
        options.codes = arfy(options.codes);
    } else {
        options = {codes: arfy(...options)};
    }
    options.codes = options.codes.length ?
        [].concat(...options.codes.map(v => typeof v === 'string' ? v.split(/\s*,\s*/) : v))
            .map(v => {
                const n = +v;
                if(!type.isNumber.finite(n) || n < 100 || n > 599) throw new TypeError(`HTTP response code expected ("${v}" found)`);
                return n;
            }) :
        null;

    return response => {
        if(!(response instanceof require('http').IncomingMessage)) throw new TypeError('IncomingMessage expected');
        if(options.codes && !options.codes.includes(response.statusCode)){
            throw new Error(`Expected status code in [${options.codes.join(', ')}] (${response.statusCode} found)`);
        }
        if(options.checkJSON && response.headers['content-type'] === 'application/json' && !type.isObject(response.body)){
            throw new Error(`Expected json-parsed object in body (${type(response.body)} found)`);
        }
    };
};
