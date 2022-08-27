module.exports = function (m, fn) {
    fn.paid_in_out = {};
    fn.paid_in_out.get = function (paid_in_out_id) {
        return new Promise((resolve, reject) => {
            m.paid_in_outs.findOne({
                where: {paid_in_out_id: paid_in_out_id},
                include: [fn.inc.canteen.holding()]
            })
            .then(paid_in_out => {
                if (paid_in_out) resolve(paid_in_out)
                else reject(new Error('Paid In/Out not found'));
            })
            .catch(err => reject(err));
        });
    };
    // CREATE FUNCTIONS
    function check_paid_in_out_create(paid_in_out) {
        return new Promise((resolve, reject) => {
            if      (!paid_in_out.reason)                       reject(new Error('No reason'))
            else if (!paid_in_out.amount)                       reject(new Error('No amount'))
            else if (!paid_in_out.holding_id)                   reject(new Error('No holding'))
            else if (!paid_in_out.user_id_paid_in_out)          reject(new Error('No user'))
            else if (!paid_in_out.paid_in)                      reject(new Error('No type'))
            else if (!['0', '1'].includes(paid_in_out.paid_in)) reject(new Error('Invalid type'))
            else resolve(true);
        });
    };
    fn.paid_in_out.create = function (paid_in_out, user_id) {
        return new Promise((resolve, reject) => {
            check_paid_in_out_create(paid_in_out)
            .then(result => {
                fn.holdings.get(paid_in_out.holding_id)
                .then(holding => {
                    fn.users.get(paid_in_out.user_id_paid_in_out)
                    .then(user_id_paid_in_out => {
                        m.paid_in_outs.create({
                            ...paid_in_out,
                            ...(paid_in_out.paid_in === '1' ? {status: 2} : {}),
                            user_id: user_id
                        })
                        .then(paid_in_out => {
                            if (paid_in_out.paid_in === '1') {
                                holding.increment('cash', {by: paid_in_out.amount})
                                .then(result => resolve(true))
                                .catch(err => reject(err));
                            } else resolve(true);
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

    // COMPLETE FUNCTIONS
    function check_paid_in_out_complete(paid_in_out) {
        return new Promise((resolve, reject) => {
            if      (paid_in_out.paid_in)      reject(new Error('This is a pay in'))
            else if (paid_in_out.status === 0) reject(new Error('This pay out has been cancelled'))
            else if (paid_in_out.status === 2) reject(new Error('This pay out is already complete'))
            else if (paid_in_out.status === 1) {
                if     (!paid_in_out.holding)                                           reject(new Error('Invalid holding'))
                else if (Number(paid_in_out.holding.cash) < Number(paid_in_out.amount)) reject(new Error('Not enough in holding'))
                else resolve(true);
            } else reject(new Error('Unknown status'));
        });
    };
    fn.paid_in_out.complete = function (paid_in_out_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.paid_in_out.get(paid_in_out_id)
            .then(paid_in_out => {
                check_paid_in_out_complete(paid_in_out)
                .then(result => {
                    paid_in_out.holding.decrement('cash', {by: paid_in_out.amount})
                    .then(result => {
                        fn.update(paid_in_out, {status: 2})
                        .then(result => {
                            fn.actions.create(
                                'PAID OUT | COMPLETED',
                                user_id,
                                [{table: 'paid_in_outs', id: paid_in_out.paid_in_out_id}]
                            )
                            .then(action => resolve(true))
                            .catch(err => {
                                console.log(err);
                                resolve(false);
                            });
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
    fn.paid_in_out.cancel = function (paid_in_out_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.paid_in_out.get(paid_in_out_id)
            .then(paid_in_out => {
                if      (paid_in_out.paid_in)      reject(new Error('This is a pay in'))
                else if (paid_in_out.status === 0) reject(new Error('This pay out has been cancelled'))
                else if (paid_in_out.status === 2) reject(new Error('This pay out is already complete'))
                else if (paid_in_out.status === 1) {
                    fn.update(paid_in_out, {status: 0})
                    .then(result => {
                        fn.actions.create(
                            'PAID OUT | CANCELLED',
                            user_id,
                            [{table: 'paid_in_outs', id: paid_in_out.paid_in_out_id}]
                        )
                        .then(action => resolve(true))
                        .catch(err => {
                            console.log(err);
                            resolve(false);
                        });
                    })
                    .catch(err => reject(err));
                } else reject(new Error('Unknown status'));
            })
            .catch(err => reject(err));
        });
    };
};