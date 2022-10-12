const arfy = require('arfy');
const type = require('easytype');
const ce = require('c-e');
const http = require('http');

const ValidateResponceError = ce('ValidateResponceError', Error, function(reasons, response){
    if(reasons.length === 1){
        this.message = reasons[0][1];
    } else {
        this.message = 'Validation failed. See reasons';
        this.reasons = reasons.map(v => v[1]);
    }
    this.codes = reasons.map(v => v[0]);
    this.url = response.url;
    this.statusCode = response.statusCode;
    this.bodyLength = response.body.length;
    this.headers = response.headers;
    this.cookies = response.cookies;
});

module.exports = (...options) => {
    if(type.isObject(options[0])){
        options = options[0];
        options.codes = arfy(options.codes);
    } else {
        options = {codes: arfy(...options)};
    }
    options.codes = options.codes.length > 0 ?
        [].concat(...options.codes.map(v => typeof v === 'string' ? v.split(/\s*,\s*/) : v))
            .map(v => {
                const n = +v;
                if(!type.isNumber.finite(n) || n < 100 || n > 599) throw new TypeError(`HTTP response code expected ("${v}" found)`);
                return n;
            }) :
        null;

    return response => {
        const reasons = [];

        if(options.codes && !options.codes.includes(response.statusCode)){
            reasons.push(['E_INVALID_STATUS', `Expected status code in [${options.codes.join(', ')}] (${response.statusCode} found)`]);
        }
        if(options.checkJSON && response.headers['content-type'] === 'application/json' && !type.isObject(response.body)){
            reasons.push(['E_INVALID_JSON', `Expected json-parsed object in body (${type(response.body)} found)`]);
        }
        if(options.checkType && !(response instanceof http.IncomingMessage)){
            reasons.push(['E_INVALID_TYPE', `Expected IncomingMessage (${response.constructor.name} found)`]);
        }
        if(type.isNumber(options.contentLength) && options.contentLength !== +response.headers['content-length']){
            reasons.push(['E_INVALID_LENGTH', `Expected content length ${options.contentLength} (${response.headers['content-length']} found)`]);
        }
        if(type.isArray(options.contentLength) && (+response.headers['content-length'] < options.contentLength[0] || +response.headers['content-length'] > options.contentLength[1])){
            reasons.push(['E_INVALID_LENGTH', `Expected content length in range ${options.contentLength.join('-')} (${response.headers['content-length']} found)`]);
        }
        if(type.isRegExp(options.bodyMatch) && type.isString(response.body) && !options.bodyMatch.test(response.body)){
            reasons.push(['E_INVALID_MATCH', `Expected body string match to ${options.bodyMatch}`]);
        }
        if(type.isFunction(options.validator)){
            try {
                const isValid = options.validator(response);
                if(isValid){
                    reasons.push(['E_INVALID_RESPONCE', `Custom validator failed with message: "${isValid}"`]);
                }
            } catch(e){
                reasons.push(['E_INVALID_RESPONCE', `Custom validator threw "${e}"`]);
            }
        }

        if(reasons.length > 0){
            throw new ValidateResponceError(reasons, response);
        }
    };
};
