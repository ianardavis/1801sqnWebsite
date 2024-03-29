module.exports = function (m, fn) {
    fn.scraps.find = function (where, line_where = null) {
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
            .catch(reject);
        });
    };
    fn.scraps.findOrCreate = function (supplier_id) {
        function checkSupplier(supplier_id) {
            return new Promise((resolve, reject) => {
                if (supplier_id) {
                    fn.suppliers.find({supplier_id: supplier_id})
                    .then(supplier => resolve(supplier))
                    .catch(reject);
    
                } else {
                    resolve(null);
    
                };
            });
        };
        return new Promise((resolve, reject) => {
            checkSupplier(supplier_id)
            .then(supplier_id_checked => {
                m.scraps.findOrCreate({
                    where: {
                        supplier_id: supplier_id_checked.supplier_id,
                        status: 1
                    }
                })
                .then(([scrap, created]) => resolve(scrap))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.scraps.findAll = function (query) {
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
            .catch(reject);
        });
    };
    fn.scraps.count = function (where) {return m.scraps.count({where: where})};

    fn.scraps.edit = function (scrap_id, details) {
        fn.scraps.find({scrap_id: scrap_id})
        .then(scrap => {
            fn.update(scrap, details)
            .then(result => resolve(true))
            .catch(reject);
        })
        .catch(reject);
    };

    fn.scraps.cancel_check = function (scrap_id) {
        return new Promise((resolve, reject) => {
            fn.scraps.find(
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
                console.error(err);
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
                    fn.update(scrap, {status: 0})
                    .then(result => {
                        fn.actions.create([
                            'SCRAP | CANCELLED',
                            user_id,
                            [{_table: 'scraps', id: scrap.scrap_id}]
                        ])
                        .then(result => resolve(result));
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.scraps.complete = function (scrap_id, user) {
        function check(scrap_id) {
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
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            check(scrap_id)
            .then(scrap => {
                let actions = [];
                scrap.lines.forEach((line) => {
                    actions.push(fn.update(line, {status: 2}));
                });
                Promise.all(actions)
                .then(result => {
                    fn.update(scrap, {status: 2})
                    .then(result => {
                        fn.scraps.pdf.create(scrap.scrap_id, user)
                        .then(result => resolve(true))
                        .catch(err => {
                            console.error(err);
                            resolve(false);
                        });
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    function getFilename(scrap_id) {
        return new Promise((resolve, reject) => {
            fn.scraps.find({scrap_id: scrap_id})
            .then(scrap => {
                if (scrap.status !== 2) {
                    reject(new Error('Scrp is not complete'));

                } else if (scrap.filename) {
                    resolve(scrap.filename);

                } else {
                    fn.scraps.pdf.create(scrap.scrap_id)
                    .then(filename => resolve(filename))
                    .catch(reject);

                };
            })
            .catch(reject);
        });
    };
    fn.scraps.download = function (scrap_id, res) {
        return new Promise((resolve, reject) => {
            getFilename(scrap_id)
            .then(filename => {
                fn.fs.download('scraps', filename, res)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.scraps.print = function (scrap_id) {
        return new Promise((resolve, reject) => {
            getFilename(scrap_id)
            .then(filename => {
                fn.pdfs.print('scraps', filename)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };
};