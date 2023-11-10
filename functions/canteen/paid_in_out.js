module.exports = function (m, fn) {
    fn.paid_in_outs = {};
    
    fn.paid_in_outs.find = function (where) {
        return fn.find(
            m.paid_in_outs,
            where,
            [
                fn.inc.users.user({as: 'user_paid_in_out'}),
                fn.inc.users.user(),
                fn.inc.canteen.holding()
            ]
        );
    };
    fn.paid_in_outs.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.paid_in_outs.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.users.user({as: 'user_paid_in_out'}),
                    fn.inc.canteen.holding()
                ],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    function createAction(paid_in_out_id, action, user_id, links = []) {
        return new Promise(resolve => {
            fn.actions.create([
                `PAID OUT | ${action}`,
                user_id,
                [{_table: 'paid_in_outs', id: paid_in_out_id}].concat(links)
            ])
            .then(action => resolve(true));
        });
    };
    function markComplete(paid_in_out, user_id, holding_id) {
        return new Promise((resolve, reject) => {
            fn.update(paid_in_out, {status: 2})
            .then(result => {
                createAction(paid_in_out.paid_in_out_id, 'COMPLETED', user_id, [{_table: 'holdings', id: holding_id}])
                .then(result => resolve(result));
            })
            .catch(reject);
        });
    };
    function markCancelled(paid_in_out, user_id) {
        return new Promise((resolve, reject) => {
            fn.update(paid_in_out, {status: 0})
            .then(result => {
                createAction(paid_in_out.paid_in_out_id, 'CANCELLED', user_id)
                .then(result => resolve(result));
            })
            .catch(reject);
        });
    };
    
    fn.paid_in_outs.create = function (paid_in_out, user_id) {
        function check(paid_in_out) {
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
        function getHoldingCheckUser(holding_id, user_id) {
            return new Promise((resolve, reject) => {
                Promise.all([
                    fn.holdings.find({holding_id: holding_id}),
                    fn.users.find({user_id: user_id})
                ])
                .then(results => resolve(results[0]))
                .catch(reject);
            });
        };
        function createPaidInOut(paid_in_out, user_id) {
            return new Promise((resolve, reject) => {
                m.paid_in_outs.create({
                    ...paid_in_out,
                    user_id: user_id
                })
                .then(paid_in_out => {
                    createAction(paid_in_out.paid_in_out_id, 'CREATED', user_id)
                    .then(result => resolve(paid_in_out));
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            if (paid_in_out) {
                check(paid_in_out)
                .then(result => {
                    getHoldingCheckUser(paid_in_out.holding_id, paid_in_out.user_id_paid_in_out)
                    .then(holding => {
                        createPaidInOut(paid_in_out, user_id)
                        .then(paid_in_out => {
                            if (paid_in_out.paid_in === '1') {
                                holding.increment('cash', {by: paid_in_out.amount})
                                .then(result => {
                                    markComplete(paid_in_out, user_id, holding.holding_id)
                                    .then(result => resolve(true));
                                })
                                .catch(reject);
    
                            } else {
                                resolve(true);
    
                            };
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);

            } else {
                reject(new Error('No details'));
            };
        });
    };

    fn.paid_in_outs.complete = function (paid_in_out_id, user_id) {
        function check(paid_in_out) {
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
        return new Promise((resolve, reject) => {
            fn.paid_in_outs.find({paid_in_out_id: paid_in_out_id})
            .then(paid_in_out => {
                check(paid_in_out)
                .then(result => {
                    paid_in_out.holding.decrement('cash', {by: paid_in_out.amount})
                    .then(result => {
                        markComplete(paid_in_out, user_id)
                        .then(result => resolve(result))
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    
    fn.paid_in_outs.cancel = function (paid_in_out_id, user_id) {
        function check(paid_in_out) {
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
        return new Promise((resolve, reject) => {
            fn.paid_in_outs.find({paid_in_out_id: paid_in_out_id})
            .then(paid_in_out => {
                check(paid_in_out)
                .then(result => {
                    markCancelled(paid_in_out.paid_in_out_id, user_id)
                    .then(result => resolve(true))
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
};