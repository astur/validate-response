const arfy = require('arfy');
module.exports = (...codes) => {
    codes = arfy(...codes);
    if(!codes.length) codes = [200];
    return response => {
        if(!(response instanceof require('http').IncomingMessage)) throw new TypeError('IncomingMessage expected');
        if(codes.includes(response.statusCode)) return;
        throw new Error(`Expected status code in [${codes.join(', ')}] (${response.statusCode} found)`);
    };
};
