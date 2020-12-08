module.exports = function(record) {
    for (let [key, value] of Object.entries(record)) {
        if (value === '') record[key] = null;
    };
    return record;
};