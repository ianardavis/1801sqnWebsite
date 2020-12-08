module.exports = function() {
    let current = new Date(),
        year   = String(current.getFullYear()),
        month  = String(current.getMonth() + 1).padStart(2, '0'),
        day    = String(current.getDate()).padStart(2, '0'),
        hour   = String(current.getHours()).padStart(2, '0'),
        minute = String(current.getMinutes()).padStart(2, '0'),
        second = String(current.getSeconds()).padStart(2, '0');
    return year + month + day + ' ' + hour + minute + second;
};