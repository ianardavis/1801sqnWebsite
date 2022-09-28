module.exports = function (m, fn) {
    fn.scraps.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.scrap_id) {
                m.scraps.findByPk(options.scrap_id)
                .then(scrap => {
                    if (scrap) {
                        resolve(scrap)
                    } else {
                        reject(new Error('Scrap not found'));
                    };
                })
                .catch(err => reject(err));
            } else {
                m.scraps.findOrCreate({
                    where: {
                        supplier_id: options.supplier_id || null,
                        status: 1
                    }
                })
                .then(([scrap, created]) => resolve(scrap))
                .catch(err => reject(err));
            };
        });
    };
    fn.scraps.edit = function (scrap_id, details) {
        fn.scraps.get({scrap_id: scrap_id})
        .then(scrap => {
            scrap.update(details)
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    };

    function complete_check(scrap) {
        return new Promise((resolve, reject) => {
            if (scrap.status === 0) {
                reject(new Error('The scrap has been cancelled'));
            } else if (scrap.status === 2) {
                reject(new Error('This scrap has already been completed'));
            } else if (scrap.status === 1) {
                if (scrap.lines.length === 0) {
                    reject(new Error('There are no open lines for this scrap'));
                } else {
                    resolve(true);
                };
            } else {
                reject (new Error('Unknown status'));
            };
        });
    };
    fn.scraps.complete = function (scrap_id, user) {
        return new Promise((resolve, reject) => {
            m.scraps.findOne({
                where: {scrap_id: scrap_id},
                include: [
                    {
                        model: m.scrap_lines,
                        as:    'lines',
                        where: {status: 1},
                        required: false
                    }
                ]
            })
            .then(scrap => {
                complete_check(scrap)
                .then(result => {
                    let actions = [];
                    scrap.lines.forEach((line) => {
                        actions.push(line.update({status: 2}));
                    });
                    Promise.all(actions)
                    .then(result => {
                        scrap.update({status: 2})
                        .then(result => {
                            if (result) {
                                fn.scraps.pdf.create(scrap.scrap_id, user)
                                .then(result => resolve(true))
                                .catch(err => {
                                    console.log(err);
                                    resolve(false);
                                });
                            } else {
                                reject(new Error('Scrap not updated'));
                            };
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};