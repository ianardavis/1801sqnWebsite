module.exports = function (m, fn) {
    fn.sales = {};
    fn.sales.payment = function (sale_id, total, sale, user_id) {
        return new Promise((resolve, reject) => {
            let payment_action = null;
            if (sale.tendered < total) {
                payment_action = new Promise((resolve, reject) => {
                    if (!sale.user_id_debit) reject(new Error('Not enough tendered'))
                    else {
                        return fn.get(
                            'credits',
                            {user_id: sale.user_id_debit}
                        )
                        .then(account => {
                            let debit_amount = Number(total - sale.tendered);
                            if (account.credit < debit_amount) reject(new Error('Not enough on account'))
                            else {
                                return account.decrement('credit', {by: debit_amount})
                                .then(result => {
                                    return account.reload()
                                    .then(updated_account => {
                                        let actions = [];
                                        if (updated_account.credit === '0.00') actions.push(updated_account.destroy())
                                        return Promise.allSettled(actions)
                                        .then(result => {
                                            resolve({
                                                payments: [
                                                    (sale.tendered > 0 ? {type: 'cash', amount: sale.tendered} : {}),
                                                    {type: 'account', amount: debit_amount}
                                                ],
                                                change: 0.00
                                            });
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            resolve({
                                                payments: [
                                                    (sale.tendered > 0 ? {type: 'cash', amount: sale.tendered} : {}),
                                                    {type: 'account', amount: debit_amount}
                                                ],
                                                change: 0.00
                                            });
                                        });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        resolve({
                                            payments: [
                                                (sale.tendered > 0 ? {type: 'cash', amount: sale.tendered} : {}),
                                                {type: 'account', amount: debit_amount}
                                            ],
                                            change: 0.00
                                        });
                                    });
                                })
                                .catch(err => reject(err));
                            };
                        })
                        .catch(err => reject(err));
                    };
                });
            } else {
                let change = Number(sale.tendered - total);
                if (change > 0 && sale.user_id_credit) {
                    payment_action = new Promise(resolve => {
                        return m.credits.findOrCreate({
                            where: {user_id: sale.user_id_credit}
                        })
                        .then(([credit, created]) => {
                            return credit.increment('credit', {by: change})
                            .then(result => {
                                resolve({
                                    payments: [{
                                        type: 'cash',
                                        amount: total
                                    }],
                                    change: 0
                                });
                            })
                            .catch(err => {
                                console.log(err)
                                resolve({
                                    payments: [{
                                        type: 'cash',
                                        amount: total
                                    }],
                                    change: change
                                });
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            resolve({
                                payments: [{
                                    type: 'cash',
                                    amount: total
                                }],
                                change: change
                            });
                        });
                    })
                } else payment_action = new Promise(resolve => {
                    resolve({
                        payments: [{
                            type: 'cash',
                            amount: total
                        }],
                        change: change
                    });
                });
            };
            return payment_action
            .then(payment_result => {
                let payments = [];
                payment_result.payments.forEach(payment => {
                    if (payment.type && payment.amount) {
                        payments.push(
                            m.payments.create({
                                sale_id: sale_id,
                                ...payment,
                                user_id: user_id
                            })
                        );
                    };
                });
                return Promise.all(payments)
                .then(result => resolve(payment_result.change))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};