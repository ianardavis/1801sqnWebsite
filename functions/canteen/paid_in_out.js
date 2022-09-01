const { resolve, reject } = require("core-js/fn/promise");

module.exports = function (m, fn) {
    fn.paid_in_out = {};
    
    fn.paid_in_out.get = function (paid_in_out_id) {
        return new Promise((resolve, reject) => {
            m.paid_in_outs.findOne({
                where: {paid_in_out_id: paid_in_out_id},
                include: [fn.inc.canteen.holding()]
            })
            .then(paid_in_out => {
                if (paid_in_out) {
                    resolve(paid_in_out);
                }else {
                    reject(new Error('Paid In/Out not found'));
                };
            })
            .catch(err => reject(err));
        });
    };
    function create_action(paid_in_out_id, action, user_id, links = []) {
        return new Promise(resolve => {
            fn.actions.create(
                `PAID OUT | ${action}`,
                user_id,
                [{table: 'paid_in_outs', id: paid_in_out_id}].concat(links)
            )
            .then(action => resolve(true));
        });
    };
    function mark_complete(paid_in_out, user_id, holding_id) {
        return new Promise((resolve, reject) => {
            paid_in_out.update({status: 2})
            .then(result => {
                create_action(paid_in_out.paid_in_out_id, 'COMPLETED', user_id, [{table: 'holdings', id: holding_id}])
                .then(result => resolve(result));
            })
            .catch(err => reject(err));
        });
    };
    function mark_cancelled(paid_in_out, user_id) {
        return new Promise((resolve, reject) => {
            paid_in_out.update({status: 0})
            .then(result => {
                create_action(paid_in_out.paid_in_out_id, 'CANCELLED', user_id)
                .then(result => resolve(result));
            })
            .catch(err => reject(err));
        });
    };
    // CREATE FUNCTIONS
    function create_check(paid_in_out) {
        return new Promise((resolve, reject) => {
            if (!paid_in_out.reason) {
                reject(new Error('No reason'));
            } else if (!paid_in_out.amount) {
                reject(new Error('No amount'));
            } else if (!paid_in_out.holding_id) {
                reject(new Error('No holding'));
            } else if (!paid_in_out.user_id_paid_in_out) {
                reject(new Error('No user'));
            } else if (!paid_in_out.paid_in) {
                reject(new Error('No type'));
            } else if (!['0', '1'].includes(paid_in_out.paid_in)) {
                reject(new Error('Invalid type'));
            } else {
                resolve(true);
            };
        });
    };
    function get_holding_check_user(holding_id, user_id) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.holdings.get(holding_id),
                fn.users.get(user_id)
            ])
            .then(results => resolve(results[0]))
            .catch(err => reject(err));
        });
    };
    function create_paid_in_out(paid_in_out, user_id) {
        return new Promise((resolve, reject) => {
            m.paid_in_outs.create({
                ...paid_in_out,
                user_id: user_id
            })
            .then(paid_in_out => {
                create_action(paid_in_out.paid_in_out_id, 'CREATED', user_id)
                .then(result => resolve(paid_in_out));
            })
            .catch(err => reject(err));
        });
    };
    fn.paid_in_out.create = function (paid_in_out, user_id) {
        return new Promise((resolve, reject) => {
            create_check(paid_in_out)
            .then(result => {
                get_holding_check_user(paid_in_out.holding_id, paid_in_out.user_id_paid_in_out)
                .then(holding => {
                    create_paid_in_out(paid_in_out, user_id)
                    .then(paid_in_out => {
                        if (paid_in_out.paid_in === '1') {
                            holding.increment('cash', {by: paid_in_out.amount})
                            .then(result => {
                                mark_complete(paid_in_out, user_id, holding.holding_id)
                                .then(result => resolve(true));
                            })
                            .catch(err => reject(err));
                        } else {
                            resolve(true);
                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    // COMPLETE FUNCTIONS
    function complete_check(paid_in_out) {
        return new Promise((resolve, reject) => {
            if (paid_in_out.paid_in) {
                reject(new Error('This is a pay in'));
            } else if (paid_in_out.status === 0) {
                reject(new Error('This pay out has been cancelled'));
            } else if (paid_in_out.status === 2) {
                reject(new Error('This pay out is already complete'));
            } else if (paid_in_out.status === 1) {
                if (!paid_in_out.holding) {
                    reject(new Error('Invalid holding'));
                } else if (Number(paid_in_out.holding.cash) < Number(paid_in_out.amount)) {
                    reject(new Error('Not enough in holding'));
                } else {
                    resolve(true);
                };
            } else {
                reject(new Error('Unknown status'));
            }
        });
    };
    fn.paid_in_out.complete = function (paid_in_out_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.paid_in_out.get(paid_in_out_id)
            .then(paid_in_out => {
                complete_check(paid_in_out)
                .then(result => {
                    paid_in_out.holding.decrement('cash', {by: paid_in_out.amount})
                    .then(result => {
                        mark_complete(paid_in_out, user_id)
                        .then(result => resolve(result))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    
    // CANCEL FUNCTIONS
    function cancel_check(paid_in_out) {
        return new Promise((resolve, reject) => {
            if (paid_in_out.paid_in) {
                reject(new Error('This is a pay in'));
            } else if (paid_in_out.status === 0) {
                reject(new Error('This pay out has been cancelled'));
            } else if (paid_in_out.status === 2) {
                reject(new Error('This pay out is already complete'));
            } else if (paid_in_out.status === 1) {
                resolve(true);
            } else {
                reject(new Error('Unknown status'));
            };
        });
    };
    fn.paid_in_out.cancel = function (paid_in_out_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.paid_in_out.get(paid_in_out_id)
            .then(paid_in_out => {
                cancel_check(paid_in_out)
                .then(result => {
                    mark_cancelled(paid_in_out.paid_in_out_id, user_id)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};