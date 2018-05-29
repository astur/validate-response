module.exports = code => response => {
    if(!(response instanceof require('http').IncomingMessage)) throw new Error('IncomingMessage expected');
    if(response.statusCode === code) return;
    throw new Error('ValidateResponceError');
};
