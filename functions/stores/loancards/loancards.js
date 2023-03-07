module.exports = function (m, fn) {
    fn.loancards.get = function (where, includes = []) {
        return new Promise((resolve, reject) => {
            m.loancards.findOne({
                where: where,
                include: [
                    fn.inc.users.user(),
                    fn.inc.users.user({as: 'user_loancard'})
                ].concat(includes)
            })
            .then(loancard => {
                if (loancard) {
                    resolve(loancard);

                } else {
                    reject(new Error('Loancard not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.loancards.findAndCountAll({
                where: where,
                include: [
                    {
                        model: m.loancard_lines,
                        as:    'lines',
                        where: {status: {[fn.op.ne]: 0}},
                        required: false
                    },
                    fn.inc.users.user(),
                    fn.inc.users.user({as: 'user_loancard'})
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    fn.loancards.edit = function (loancard_id, details) {
        return new Promise((resolve, reject) => {
            fn.loancards.get({loancard_id: loancard_id})
            .then(loancard => {
                loancard.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.count = function (where) { return m.loancards.count({where: where}) };
    
    function cancel_loancard_check(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(
                {loancard_id: loancard_id},
                [{
                    model: m.loancard_lines,
                    as: 'lines',
                    where: {status: {[fn.op.or]: [1, 2, 3]}},
                    required: false
                }]
            )
            .then(loancard => {
                if (loancard.status === 0) {
                    reject(new Error('This loancard has already been cancelled'));

                } else if (loancard.status === 1) {
                    if (loancard.lines && loancard.lines > 0) {
                        reject(new Error('You can not cancel a loancard with uncancelled lines'));

                    } else {
                        resolve(loancard);

                    };
                } else if (loancard.status === 2) {
                    reject(new Error('This loancard has already been completed'));

                } else if (loancard.status === 3) {
                    reject(new Error('This loancard has already been closed'));

                } else {
                    reject(new Error('Unknown loancard status'));
                };
            })
            .then(err => reject(err));
        });
    };
    fn.loancards.cancel = function (options = {}) {
        return new Promise((resolve, reject) => {
            cancel_loancard_check(options.loancard_id)
            .then(loancard => {
                loancard.update({status: 0})
                .then(result => {
                    if (result) {
                        fn.actions.create(
                            'LOANCARD | CANCELLED',
                            options.user_id,
                            [{_table: 'loancards', id: loancard.loancard_id}]
                        )
                        .then(action => resolve(true));

                    } else {
                        reject(new Error('Loancard not cancelled'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            m.loancards.findOrCreate({
                where: {
                    user_id_loancard: options.user_id_loancard,
                    status:           1
                },
                defaults: {user_id: options.user_id}
            })
            .then(([loancard, created]) => resolve(loancard.loancard_id))
            .catch(err => reject(err));
        });
    };

    function complete_check(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(
                {loancard_id: loancard_id},
                [{
                    model: m.loancard_lines,
                    as: 'lines',
                    where: {status: {[fn.op.or]: [1, 2]}},
                    required: false
                }]
            ) 
            .then(loancard => {
                if (loancard.status !== 1) {
                    reject(new Error('Loancard is not in draft'));

                } else if (!loancard.lines || loancard.lines.length === 0) {
                    reject(new Error('No open lines'));

                } else {
                    resolve(loancard);
                    
                };
            })
            .catch(err => reject(err));
        });
    };
    function update_lines(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(new Promise((resolve, reject) => {
                    line.update({status: 2})
                    .then(result => {
                        if (result) {
                            resolve({_table: 'loancard_lines', id: line.loancard_line_id});

                        } else {
                            reject(new Error('Line not updated'));

                        };
                    })
                    .catch(err => reject(err));
                }));
            });
            Promise.all(actions)
            .then(links => resolve(links))
            .catch(err => reject(err));
        });
    };
    fn.loancards.complete = function (options = {}) {
        return new Promise((resolve, reject) => {
            complete_check(options.loancard_id)
            .then(loancard => {
                update_lines(loancard.lines)
                .then(line_links => {
                    loancard.update({
                        status:   2,
                        date_due: options.date_due
                    })
                    .then(result => {
                        if (result) {
                            fn.actions.create(
                                'LOANCARD | COMPLETED',
                                options.user_id,
                                [{_table: 'loancards', id: loancard.loancard_id}].concat(line_links)
                            )
                            .then(action => resolve(loancard.loancard_id));

                        } else {
                            reject(new Error('Loancard not updated'));

                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function getLoancardFilename(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get({loancard_id: loancard_id})
            .then(loancard => {
                if (!loancard.filename) {
                    fn.loancards.pdf.create(loancard.loancard_id)
                    .then(filename => resolve(filename))
                    .catch(err => reject(err));

                } else {
                    resolve(loancard.filename);
                
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.download = function (loancard_id, res) {
        return new Promise((resolve, reject) => {
            getLoancardFilename(loancard_id)
            .then(filename => {
                fn.fs.download('loancards', filename, res)
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    
    fn.loancards.print = function (loancard_id) {
        return new Promise((resolve, reject) => {
            getLoancardFilename(loancard_id)
            .then(filename => {
                fn.pdfs.print('loancards', filename)
                .then(result => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function close_check(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(
                {loancard_id: loancard_id},
                [{
                    model: m.loancard_lines,
                    as: 'lines',
                    where: {status: {[fn.op.or]: [1, 2]}},
                    required: false
                }]
            )
            .then(loancard => {
                if (loancard.lines.length > 0) {
                    reject(new Error('Loancard has open lines'));

                } else {
                    resolve(loancard);
                    
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.close = function (options = {}) {
        return new Promise((resolve, reject) => {
            close_check(options.loancard_id)
            .then(loancard => {
                loancard.update({status: 3})
                .then(result => {
                    if (result) {
                        fn.actions.create(
                            'LOANCARD | CLOSED',
                            options.user_id,
                            [{_table: 'loancards', id: loancard.loancard_id}]
                        )
                        .then(action => resolve(true));

                    } else {
                        reject(new Error('Loancard not updated'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};