module.exports = code => response => {
    if(response.statusCode === code) return;
    throw new Error('ValidateResponceError');
};
