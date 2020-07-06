singularise = str => {
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
capitalise = str => {return str.substring(0, 1).toUpperCase() + str.substring(1, str.length)};