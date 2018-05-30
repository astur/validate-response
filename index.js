module.exports = code => response => {
    if(!(response instanceof require('http').IncomingMessage)) throw new TypeError('IncomingMessage expected');
    if(response.statusCode === code) return;
    throw new Error(`Expected status code ${code} (${response.statusCode} found)`);
};
