module.exports = function() {
    let current = new Date();
    return `${String(current.getFullYear())}${String(current.getMonth() + 1).padStart(2, '0')}${String(current.getDate()).padStart(2, '0')} ${ String(current.getHours()).padStart(2, '0')}${String(current.getMinutes()).padStart(2, '0')}${String(current.getSeconds()).padStart(2, '0')}`;
};