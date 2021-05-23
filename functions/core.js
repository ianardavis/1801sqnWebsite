module.exports = function (m, fn) {
    fn.send_error = function (res, err) {
        if (err.message) console.log(err);
        res.send({success: false, message: err.message || err});
    };
    fn.add_years = function (addYears = 0) {
        var newDate = new Date();
        var dd = String(newDate.getDate()).padStart(2, '0');
        var MM = String(newDate.getMonth() + 1).padStart(2, '0');
        var yyyy = newDate.getFullYear() + addYears;
        newDate = yyyy + '-' + MM + '-' + dd;
        return newDate;
    };
    fn.allowed = function (user_id, permission, allow = false) {
        return new Promise((resolve, reject) => {
            return m.permissions.findOne({
                where: {
                    permission: permission,
                    user_id:    user_id
                },
                attributes: ['permission']
            })
            .then(permission => {
                if (!permission) {
                    if (allow) resolve(false)
                    else reject(new Error(`Permission denied: ${permission}`))
                } else resolve(true);
            })
            .catch(err => reject(err));
        });
    };
    fn.counter = function () {
        let count = 0;
        return () => {
            return ++count;
        };
    };
    fn.download = function (file, req, res) {
        let path = `${process.env.ROOT}/public/res/`;
        res.download(path + file, path + file, err => {
            if (err) {
                console.log(err);
                req.flash('danger', err.message);
            };
        });
    };
    fn.nullify = function (record) {
        for (let [key, value] of Object.entries(record)) {
            if (value === '') record[key] = null;
        };
        return record;
    };
    fn.promise_results = function (results) {
        let rejects = results.filter(e => e.status === 'rejected');
        rejects.forEach(reject => console.log(reject));
        return (rejects.length === 0);
    };
    fn.summer = function (items) {
        if (items == null) return 0;
        return items.reduce((a, b) => {
            return b['_qty'] == null ? a : a + b['_qty'];
        }, 0);
    };
    fn.timestamp = function () {
        let current = new Date();
        return `${String(current.getFullYear())}${String(current.getMonth() + 1).padStart(2, '0')}${String(current.getDate()).padStart(2, '0')} ${ String(current.getHours()).padStart(2, '0')}${String(current.getMinutes()).padStart(2, '0')}${String(current.getSeconds()).padStart(2, '0')}`;
    };
};