module.exports = {
    counter: function () {
        let count = 0;
        return () => {
            return ++count;
        };
    },
    timestamp: function () {
        let current = new Date(),
            year   = String(current.getFullYear()),
            month  = String(current.getMonth() + 1).padStart(2, '0'),
            day    = String(current.getDate()).padStart(2, '0'),
            hour   = String(current.getHours()).padStart(2, '0'),
            minute = String(current.getMinutes()).padStart(2, '0'),
            second = String(current.getSeconds()).padStart(2, '0');
        return year + month + day + ' ' + hour + minute + second;
    },
    promiseResults: function(results) {
        let rejects = results.filter(e => e.status === 'rejected');
        rejects.forEach(reject => console.log(reject));
        return (rejects.length === 0);
    },
    download: function(file, req, res) {
        let path = `${process.env.ROOT}/public/res/`;
        res.download(path + file, path + file, err => {
            if (err) {
                console.log(err);
                req.flash('danger', err.message);
            };
        });
    },
    addYears: function(addYears = 0) {
        var newDate = new Date();
        var dd = String(newDate.getDate()).padStart(2, '0');
        var MM = String(newDate.getMonth() + 1).padStart(2, '0');
        var yyyy = newDate.getFullYear() + addYears;
        newDate = yyyy + '-' + MM + '-' + dd;
        return newDate;
    },
    summer: function(items) {
        if (items == null) return 0;
        return items.reduce((a, b) => {
            return b['_qty'] == null ? a : a + b['_qty'];
        }, 0);
    },
    singularise: function(str) {
        if (str.endsWith('lines')) {
            return str.substring(0, str.length - 1);
        } else if (str.endsWith('ies')) {
            return str.substring(0, str.length - 3) + 'y';
        } else if (str.endsWith('es')) {
            return str.substring(0, str.length - 2);
        } else {
           return str.substring(0, str.length - 1);
        };
    },
    nullify: function(record) {
        for (let [key, value] of Object.entries(record)) {
            if (value === '') record[key] = null;
        };
        return record;
    }
};