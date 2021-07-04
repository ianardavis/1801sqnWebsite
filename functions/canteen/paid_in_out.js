module.exports = function (m, fn) {
    fn.paid_in_out = {};
    fn.paid_in_out.create = function (paid_in_out, user_id) {
        return new Promise((resolve, reject) => {
            if      (!paid_in_out.reason)              reject(new Error('No reason'))
            else if (!paid_in_out.amount)              reject(new Error('No amount'))
            else if (!paid_in_out.holding_id)          reject(new Error('No holding'))
            else if (!paid_in_out.user_id_paid_in_out) reject(new Error('No user'))
            else if (!paid_in_out.paid_in)             reject(new Error('No type'))
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
                            ...(paid_in_out.paid_in === '1' ?  {status: 2} : {})
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
};