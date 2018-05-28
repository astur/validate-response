module.exports = () => response => {
    if(response.statusCode === 200) return;
    throw new Error('ValidateResponceError');
};
