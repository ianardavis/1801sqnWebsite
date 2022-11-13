module.exports = function (m, fn) {
    fn.scraps.lines.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            m.scrap_lines.findAll({
                where: options.where || {},
                include: [
                    fn.inc.stores.serial(),
                    fn.inc.stores.nsn(),
                    fn.inc.stores.size()
                ]
            })
            .then(lines => resolve(lines))
            .catch(err => reject(err));
        })
    };
    function check_nsn(nsn_id, size_id) {
        return new Promise((resolve, reject) => {
            m.nsns.findByPk(nsn_id)
            .then(nsn => {
                if (!nsn) {
                    reject(new Error('NSN not found'));

                } else if (nsn.size_id !== size_id) {
                    reject(new Error('NSN not for this size'));

                } else {
                    resolve(true);

                };
            })
            .catch(err => reject(err));
        });
    };
    function check_serial(serial_id, size_id) {
        return new Promise((resolve, reject) => {
            m.serials.findByPk(serial_id)
            .then(serial => {
                if (!serial) {
                    reject(new Error('Serial not found'));

                } else if (serial.size_id !== size_id) {
                    reject(new Error('Serial not for this size'));

                } else {
                    resolve(true);

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.scraps.lines.add = function (scrap_id, size_id, options = {}) {
        return new Promise((resolve, reject) => {
            Promise.all([]
                .concat((options.nsn_id    ? [check_nsn(   options.nsn_id,    size_id)] : []))
                .concat((options.serial_id ? [check_serial(options.serial_id, size_id)] : []))
            )
            .then(preChecks => {
                m.scrap_lines.findOrCreate({
                    where: {
                        scrap_id: scrap_id,
                        size_id:  size_id,
                        ...(options.nsn_id    ? {nsn_id:    options.nsn_id}    : {}),
                        ...(options.serial_id ? {serial_id: options.serial_id} : {})
                    },
                    defaults: {
                        qty: options.qty
                    }
                })
                .then(([line, created]) => {
                    if (created) {
                        resolve(true);

                    } else {
                        line.increment('qty', {by: options.qty})
                        .then(result => {
                            if (result) {
                                resolve(line.line_id);

                            } else {
                                reject(new Error('Existing scrap line not incremented'));

                            };
                        })
                        .catch(err => reject(err));
                        
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => {
                console.log(err);
                reject(new Error('Error doing pre scrap checks'));
            });
        });
    };
};