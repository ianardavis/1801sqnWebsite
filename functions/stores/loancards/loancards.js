module.exports = function (m, fn) {
    fn.loancards.get = function (loancard_id, includes = []) {
        return new Promise((resolve, reject) => {
            m.loancards.findOne({
                where: {loancard_id: loancard_id},
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
    fn.loancards.edit = function (loancard_id, details) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(loancard_id)
            .then(loancard => {
                loancard.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    
    function cancel_loancard_check(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(
                loancard_id,
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
    fn.loancards.cancel    = function (options = {}) {
        return new Promise((resolve, reject) => {
            cancel_loancard_check(options.loancard_id)
            .then(loancard => {
                loancard.update({status: 0})
                .then(result => {
                    if (result) {
                        fn.actions.create(
                            'LOANCARD | CANCELLED',
                            options.user_id,
                            [{table: 'loancards', id: loancard.loancard_id}]
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
    fn.loancards.create    = function (options = {}) {
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
                loancard_id,
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
    fn.loancards.complete  = function (options = {}) {
        return new Promise((resolve, reject) => {
            complete_check(options.loancard_id)
            .then(loancard => {
                let actions = [];
                actions.push(loancard.update({
                    status:   2,
                    date_due: options.date_due
                }));
                lines.forEach(line => {
                    actions.push(new Promise((resolve, reject) => {
                        line.update({status: 2})
                        .then(result => {
                            fn.actions.create(
                                'LOANCARD | COMPLETED',
                                options.user_id,
                                [{table: 'loancard_lines', id: line.loancard_line_id}]
                            )
                            .then(action => resolve(true));
                        })
                        .catch(err => reject(err));
                    }));
                });
                actions.push(m.loancard_lines.update(
                    {status: 2},
                    {where: {
                        loancard_id: loancard.loancard_id,
                        status:      {[fn.op.or]: [1, 2]}
                    }}
                ));
                Promise.all(actions)
                .then(result => {
                    fn.actions.create(
                        'LOANCARD | COMPLETED',
                        options.user_id,
                        [{table: 'loancards', id: loancard.loancard_id}]
                    )
                    .then(action => resolve(true));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function close_check(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(
                loancard_id,
                [{
                    model: m.loancard_lines,
                    as: 'lines',
                    where: {status: {[fn.op.or]: [1, 2]}},
                    required: false
                }]
            )
            .then(loancard => {
                if (loancard.lines.length > 0) {
                    reject(new Error('Loancard not ready to b e closed yet'));

                } else {
                    resolve(loancard);
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.close     = function (options = {}) {
        return new Promise((resolve, reject) => {
            close_check(options.loancard_id)
            .then(loancard => {
                loancard.update({status: 3})
                .then(result => {
                    if (result) {
                        fn.actions.create(
                            'LOANCARD | CLOSED',
                            options.user_id,
                            [{table: 'loancards', id: loancard.loancard_id}]
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