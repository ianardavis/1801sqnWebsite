module.exports = function (m, fn) {
    fn.paid_in_out = {};
    fn.paid_in_out.create = function (paid_in_out, user_id) {
        return new Promise((resolve, reject) => {
            if      (!paid_in_out.reason)                       reject(new Error('No reason'))
            else if (!paid_in_out.amount)                       reject(new Error('No amount'))
            else if (!paid_in_out.holding_id)                   reject(new Error('No holding'))
            else if (!paid_in_out.user_id_paid_in_out)          reject(new Error('No user'))
            else if (!paid_in_out.paid_in)                      reject(new Error('No type'))
            else if (!['0', '1'].includes(paid_in_out.paid_in)) reject(new Error('Invalid type'))
            else {
                fn.get(
                    'holdings',
                    {holding_id: paid_in_out.holding_id}
                )
                .then(holding => {
                    fn.get(
                        'users',
                        {user_id: paid_in_out.user_id_paid_in_out}
                    )
                    .then(user_id_paid_in_out => {
                        return m.paid_in_outs.create({
                            ...paid_in_out,
                            user_id: user_id,
                            ...(paid_in_out.paid_in === '1' ? {status: 2} : {})
                        })
                        .then(paid_in_out => {
                            if (paid_in_out.paid_in === '1') {
                                return holding.increment('cash', {by: paid_in_out.amount})
                                .then(result => {
                                    if (!result) reject(new Error('Holding not updated'))
                                    else resolve(true);
                                })
                                .catch(err => reject(err));
                            } else resolve(true);
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    fn.paid_in_out.complete = function (paid_in_out_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'paid_in_outs',
                {paid_in_out_id: paid_in_out_id},
                [fn.inc.canteen.holding()]
            )
            .then(paid_in_out => {
                if      (paid_in_out.paid_in)      reject(new Error('This is a pay in'))
                else if (paid_in_out.status === 0) reject(new Error('This pay out has been cancelled'))
                else if (paid_in_out.status === 2) reject(new Error('This pay out is already complete'))
                else if (paid_in_out.status === 1) {
                    if     (!paid_in_out.holding)                                           reject(new Error('Invalid holding'))
                    else if (Number(paid_in_out.holding.cash) < Number(paid_in_out.amount)) reject(new Error('Not enough in holding'))
                    else {
                        return paid_in_out.holding.decrement('cash', {by: paid_in_out.amount})
                        .then(result => {
                            if (!result) reject(new Error('Holding not updated'))
                            else {
                                return paid_in_out.update({status: 2})
                                .then(result => {
                                    if (!result) reject(new Error('Holding decremented. Pay out not updated'))
                                    else {
                                        return fn.actions.create({
                                            action: 'Pay out completed',
                                            user_id: user_id,
                                            links: [
                                                {table: 'paid_in_outs', id: paid_in_out.paid_in_out_id}
                                            ]
                                        })
                                        .then(action => resolve(true))
                                        .catch(err => {
                                            console.log(err);
                                            resolve(false);
                                        });
                                    };
                                })
                            };
                        })
                        .catch(err => reject(err));
                    };
                } else reject(new Error('Unknown status'));
            })
            .catch(err => reject(err));
        });
    };
    fn.paid_in_out.cancel = function (paid_in_out_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'paid_in_outs',
                {paid_in_out_id: paid_in_out_id}
            )
            .then(paid_in_out => {
                if      (paid_in_out.paid_in)      reject(new Error('This is a pay in'))
                else if (paid_in_out.status === 0) reject(new Error('This pay out has been cancelled'))
                else if (paid_in_out.status === 2) reject(new Error('This pay out is already complete'))
                else if (paid_in_out.status === 1) {
                    return paid_in_out.update({status: 0})
                    .then(result => {
                        if (!result) reject(new Error('Pay out not updated'))
                        else {
                            return fn.actions.create({
                                action: 'Pay out cancelled',
                                user_id: user_id,
                                links: [
                                    {table: 'paid_in_outs', id: paid_in_out.paid_in_out_id}
                                ]
                            })
                            .then(action => resolve(true))
                            .catch(err => {
                                console.log(err);
                                resolve(false);
                            });
                        };
                    })
                    .catch(err => reject(err));
                } else reject(new Error('Unknown status'));
            })
            .catch(err => reject(err));
        });
    };
};