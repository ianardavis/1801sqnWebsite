module.exports = function (m, fn) {
    fn.scraps.get = function (where, line_where = null) {
        return new Promise((resolve, reject) => {
            m.scraps.findOne({
                where: where,
                include: [
                    fn.inc.stores.scrap_lines(line_where, false),
                    fn.inc.stores.supplier()
                ]
            })
            .then(scrap => {
                if (scrap) {
                    resolve(scrap);

                } else {
                    reject(new Error('Scrap not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    function check_supplier(supplier_id) {
        return new Promise((resolve, reject) => {
            if (supplier_id) {
                fn.suppliers.get({supplier_id: supplier_id})
                .then(supplier => resolve(supplier))
                .catch(err => reject(err));

            } else {
                resolve(null);

            };
        });
    };
    fn.scraps.getOrCreate = function (supplier_id) {
        return new Promise((resolve, reject) => {
            check_supplier(supplier_id)
            .then(supplier_id_checked => {
                m.scraps.findOrCreate({
                    where: {
                        supplier_id: supplier_id_checked.supplier_id,
                        status: 1
                    }
                })
                .then(([scrap, created]) => resolve(scrap))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.scraps.getAll = function (query) {
        return new Promise((resolve, reject) => {
            m.scraps.findAndCountAll({
                where: query.where,
                include: [
                    {
                        model: m.scrap_lines,
                        as:    'lines',
                        where: {status: {[fn.op.ne]: 0}},
                        required: false
                    },
                    fn.inc.stores.supplier()
                ],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    fn.scraps.count = function (where) {return m.scraps.count({where: where})};

    fn.scraps.edit = function (scrap_id, details) {
        fn.scraps.get({scrap_id: scrap_id})
        .then(scrap => {
            scrap.update(details)
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    };

    fn.scraps.cancel_check = function (scrap_id) {
        return new Promise((resolve, reject) => {
            fn.scraps.get(
                {scrap_id: scrap_id},
                {
                    status: {[fn.op.or]: [1]},
                    qty:    {[fn.op.gt]: 0}
                }
            )
            .then(scrap => {
                if (scrap.status === 0) {
                    reject(new Error('Scrap has already been cancelled'));

                } else if (scrap.status === 1) {
                    if (!scrap.lines || scrap.lines.length === 0) {
                        resolve(scrap);

                    } else {
                        reject(new Error('Scrap has open lines'));

                    };
                } else if (scrap.status === 2) {
                    reject(new Error('Scrap has already been closed'));

                } else {
                    reject(new Error('Unknown scrap status'));
                
                };
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    };
    fn.scraps.cancel = function (scrap_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.scraps.cancel_check(scrap_id)
            .then(scrap => {
                m.scrap_lines.update(
                    {status: 0},
                    {where: {status: {[fn.op.or]: [1]}}
                })
                .then(results => {
                    scrap.update({status: 0})
                    .then(result => {
                        if (result) {
                            fn.actions.create(
                                'SCRAP | CANCELLED',
                                user_id,
                                [{_table: 'scraps', id: scrap.scrap_id}]
                            )
                            .then(result => resolve(result));

                        } else {
                            reject(new Error('Scrap not cancelled'));

                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function complete_check(scrap_id) {
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
                if (scrap.status === 0) {
                    reject(new Error('The scrap has been cancelled'));

                } else if (scrap.status === 2) {
                    reject(new Error('This scrap has already been completed'));

                } else if (scrap.status === 1) {
                    if (scrap.lines.length === 0) {
                        reject(new Error('There are no open lines for this scrap'));

                    } else {
                        resolve(scrap);

                    };
                } else {
                    reject (new Error('Unknown status'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.scraps.complete = function (scrap_id, user) {
        return new Promise((resolve, reject) => {
            complete_check(scrap_id)
            .then(scrap => {
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
        });
    };

    function get_scrap_filename(scrap_id) {
        return new Promise((resolve, reject) => {
            fn.scraps.get({scrap_id: scrap_id})
            .then(scrap => {
                if (scrap.status !== 2) {
                    reject(new Error('Scrp is not complete'));

                } else if (scrap.filename) {
                    resolve(scrap.filename);

                } else {
                    fn.scraps.pdf.create(scrap.scrap_id)
                    .then(filename => resolve(filename))
                    .catch(err => reject(err));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.scraps.download = function (scrap_id, res) {
        return new Promise((resolve, reject) => {
            get_scrap_filename(scrap_id)
            .then(filename => {
                fn.fs.download('scraps', filename, res)
                .then(result => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.scraps.print = function (scrap_id) {
        return new Promise((resolve, reject) => {
            get_scrap_filename(scrap_id)
            .then(filename => {
                fn.pdfs.print('scraps', filename)
                .then(result => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};