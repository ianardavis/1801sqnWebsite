module.exports = function(str) {
    if (str.endsWith('lines')) {
        return str.substring(0, str.length - 1);
    } else if (str.endsWith('ies')) {
        return str.substring(0, str.length - 3) + 'y';
    } else if (str.endsWith('es')) {
        return str.substring(0, str.length - 2);
    } else {
       return str.substring(0, str.length - 1);
    };
};