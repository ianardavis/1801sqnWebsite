module.exports = function (m, fn) {
    fn.sales = {};
    fn.sales.lines = {};
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
                                                    (sale.tendered > 0 ? {type: 'Cash', amount: sale.tendered} : {}),
                                                    {type: 'Account', amount: debit_amount}
                                                ],
                                                change: 0.00
                                            });
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            resolve({
                                                payments: [
                                                    (sale.tendered > 0 ? {type: 'Cash', amount: sale.tendered} : {}),
                                                    {type: 'Account', amount: debit_amount}
                                                ],
                                                change: 0.00
                                            });
                                        });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        resolve({
                                            payments: [
                                                (sale.tendered > 0 ? {type: 'Cash', amount: sale.tendered} : {}),
                                                {type: 'Account', amount: debit_amount}
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
                                        type: 'Cash',
                                        amount: Number(sale.tendered)
                                    }],
                                    change: 0
                                });
                            })
                            .catch(err => {
                                console.log(err)
                                resolve({
                                    payments: [{
                                        type: 'Cash',
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
                                    type: 'Cash',
                                    amount: total
                                }],
                                change: change
                            });
                        });
                    })
                } else payment_action = new Promise(resolve => {
                    resolve({
                        payments: [{
                            type: 'Cash',
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
    fn.sales.complete = function (sale_id, _sale, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'sales',
                {sale_id: sale_id}
            )
            .then(sale => {
                if (sale.status !== 1) reject(new Error('Sale is not open'))
                else {
                    return m.sale_lines.findAll({
                        where: {sale_id: sale.sale_id}
                    })
                    .then(lines => {
                        if (lines.length === 0) reject(new Error('No open lines on this sale'));
                        else {
                            let total = 0.00;
                            lines.forEach(line => {total += line.qty * line.price});
                            return fn.sales.payment(sale.sale_id, total, _sale, user_id)
                            .then(change => {
                                let actions = [];
                                actions.push(sale.update({status: 2}));
                                lines.forEach(line => {
                                    actions.push(
                                        new Promise((resolve, reject) => {
                                            fn.get(
                                                'canteen_items',
                                                {item_id: line.item_id}
                                            )
                                            .then(item => {
                                                return item.decrement('qty', {by: line.qty})
                                                .then(result => {
                                                    if (!result) reject(new Error('Quantity not updated'))
                                                    else resolve(true)
                                                })
                                                .catch(err => reject(err));
                                            })
                                        })
                                    );
                                })
                                return Promise.all(actions)
                                .then(result => resolve(change))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.sales.lines.create = function (line) {
        return new Promise((resolve, reject) => {
            if (!line.item_id) reject(new Error('No Item'))
            else {
                fn.get(
                    'sales',
                    {sale_id: line.sale_id},
                    [fn.inc.canteen.session()]
                )
                .then(sale => {
                    if (sale.session.status !== 1) reject(new Error('Session for this sale is not open'))
                    else {
                        return fn.get(
                            'canteen_items',
                            {item_id: line.item_id}
                        )
                        .then(item => {
                            return m.sale_lines.findOrCreate({
                                where: {
                                    sale_id: sale.sale_id,
                                    item_id: item.item_id
                                },
                                defaults: {
                                    qty:   line.qty || 1,
                                    price: item.price
                                }
                            })
                            .then(([sale_line, created]) => {
                                if (created) resolve(true)
                                else {
                                    return sale_line.increment('qty', {by: line.qty || 1})
                                    .then(result => {
                                        if (result) resolve(true)
                                        else        reject(new Error('Line not updated'));
                                    })
                                    .catch(err => reject(err));
                                };
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            };
        });
    };
    fn.sales.lines.edit = function (_line) {
        return new Promise((resolve, reject) => {
            fn.get(
                'sale_lines',
                {sale_line_id: _line.sale_line_id},
                [fn.inc.canteen.sale({session: true})]
            )
            .then(line => {
                if (line.sale.session.status !== 1) reject(new Error('Session for this line is not open'))
                else {
                    return line.increment('qty', {by: _line.qty})
                    .then(result => {
                        return line.reload()
                        .then(result => {
                            if (result) {
                                if (line.qty === 0) {
                                    return line.destroy()
                                    .then(result => { 
                                        if (result) resolve(true)
                                        else reject(new Error('Line not updated'));
                                    })
                                } else resolve(true);
                            } else reject(new Error('Line not updated'));
                        })
                        .catch(err => reject(err))
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};