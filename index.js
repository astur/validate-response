const arfy = require('arfy');
const type = require('easytype');

module.exports = (...options) => {
    if(type.isObject(options[0])){
        options = options[0];
        options.codes = arfy(options.codes);
    } else {
        options = {codes: arfy(...options)};
    }
    options.codes = options.codes
        .map(v => typeof v === 'string' ? v.split(/\s*,\s*/) : v);
    options.codes = [].concat(...options.codes).map(Number);
    if(!options.codes.length) options.codes = [200];

    return response => {
        if(!(response instanceof require('http').IncomingMessage)) throw new TypeError('IncomingMessage expected');
        if(options.codes.includes(response.statusCode)) return;
        throw new Error(`Expected status code in [${options.codes.join(', ')}] (${response.statusCode} found)`);
    };
};
