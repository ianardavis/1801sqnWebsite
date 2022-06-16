module.exports = function (m, fn) {
    fn.sales = {lines: {}, payments: {}};
    function debit_account(sale_id, account, amount, user_id) {
        return new Promise((resolve, reject) => {
            fn.decrement(account, amount, 'credit')
            .then(result => {
                fn.payments.create(
                    sale_id,
                    amount,
                    user_id,
                    'Account'
                )
                .then(result => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function credit_account(user_id_credit, amount) {
        return new Promise(resolve => {
            m.credits.findOrCreate({
                where: {user_id: user_id_credit},
                defaults: {credit: amount}
            })
            .then(([credit, created]) => {
                if (created) resolve(0)
                else {
                    fn.increment(credit, amount, 'credit')
                    .then(result => resolve(0))
                    .catch(err => {
                        console.log(err)
                        resolve(amount);
                    });
                };
            })
            .catch(err => {
                console.log(err)
                resolve(amount);
            });
        });
    };
    function get_sale_total(sale_id) {
        return new Promise((resolve, reject) => {
            m.sale_lines.findAll({
                where: {sale_id: sale_id}
            })
            .then(lines => {
                if (lines.length === 0) reject(new Error('No open lines on this sale'));
                else {
                    let total = 0;
                    lines.forEach(line => {total += (line.qty * line.price)});
                    // let total = lines.reduce((a, b) => {a + (b.qty * b.price)});
                    resolve(total);
                };
            })
            .catch(err => reject(err));
        });
    };
    function get_payment_total(sale_id) {
        return new Promise((resolve, reject) => {
            m.payments.sum('amount', {where: {sale_id: sale_id}})
            .then(paid => resolve(paid))
            .catch(err => reject(err));
        });
    };
    function process_account_payment(user_id_debit, balance, sale_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'credits',
                {user_id: user_id_debit}
            )
            .then(account => {
                if (balance <= account.credit) {
                    debit_account(sale_id, account, balance, user_id)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                } else {
                    debit_account(sale_id, account, account.credit, user_id)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function confirm_payments(sale_id) {
        return new Promise((resolve, reject) => {
            m.payments.update({status: 2}, {where: {sale_id: sale_id, status: 1}})
            .then(result => {
                if (!result) reject(new Error('Payments not confirmed'))
                else resolve(true);
            })
            .catch(err => reject(err));
        });
    };
    function process_payments(sale_id, sale, user_id) {
        return new Promise((resolve, reject) => {
            Promise.all( //Process cash payments first
                (sale.tendered && sale.tendered > 0 ?
                    [fn.payments.create(sale_id, sale.tendered, user_id)] :
                    []
                )
            )
            .then(result => {
                get_payment_total(sale_id) //Check total payments made
                .then(paid => {
                    get_sale_total(sale_id)
                    .then(total => {
                        let balance = Number(total - paid);
                        Promise.all(
                            (paid < total && sale.user_id_debit ? 
                                [process_account_payment(sale.user_id_debit, balance, sale_id, user_id)] : 
                                []
                            )
                        )
                        .then(result => {
                            get_payment_total(sale_id)
                            .then(paid => {
                                if (paid >= total) {
                                    confirm_payments(sale_id)
                                    .then(result => {
                                        if (sale.user_id_credit) {
                                            credit_account(sale.user_id_credit, Number(paid - total))
                                            .then(change => resolve(change))
                                            .catch(err => {
                                                console.log(err);
                                                resolve(Number(paid - total));
                                            });
                                        } else resolve(Number(paid - total));
                                    })
                                    .catch(err => reject(err));
                                } else reject(new Error('Not enough tendered or in credit'));
                            })
                            .catch(err => reject(err));
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
    function subtract_sold_qty_from_stock(item_id, qty) {
        return new Promise((resolve, reject) => {
            fn.get(
                'canteen_items',
                {item_id: item_id}
            )
            .then(item => {
                fn.decrement(item, qty)
                .then(result => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }
    fn.sales.complete = function (sale_id, _sale, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'sales',
                {sale_id: sale_id},
                [{model: m.sale_lines, as: 'lines'}]
            )
            .then(sale => {
                if      (sale.status === 0) reject(new Error('Sale has been cancelled'))
                else if (sale.status === 2) reject(new Error('Sale has already been completed'))
                else if (sale.status === 1) {
                    process_payments(sale.sale_id, _sale, user_id)
                    .then(change => {
                        let actions = [fn.update(sale, {status: 2})];
                        sale.lines.forEach(line => actions.push(subtract_sold_qty_from_stock(line.item_id, line.qty)))
                        Promise.all(actions)
                        .then(result => resolve(change))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                } else reject(new Error('Unknown sale status'));
            })
            .catch(err => reject(err));
        });
    };

    function check_sale(sale_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'sales',
                {sale_id: sale_id},
                [fn.inc.canteen.session()]
            )
            .then(sale => {
                if      (!sale.session)             reject(new Error('Session not found'))
                else if (sale.session.status !== 1) reject(new Error('Session for this sale is not open'))
                else resolve(sale);
            })
            .catch(err => reject(err));
        });
    };
    function check_sale_line(sale_line_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'sale_lines',
                {sale_line_id: sale_line_id},
                [fn.inc.canteen.sale({session: true})]
            )
            .then(line => {
                if      (!line.sale)                     reject(new Error('Sale not found'))
                else if (!line.sale.session)             reject(new Error('Session not found'))
                else if (line.sale.session.status !== 1) reject(new Error('Session for this sale is not open'))
                else resolve(line);
            })
            .catch(err => reject(err));
        });
    };
    fn.sales.lines.create = function (line) {
        return new Promise((resolve, reject) => {
            if (!line.item_id) reject(new Error('No Item'))
            else {
                check_sale(line.sale_id)
                .then(sale => {
                    fn.get(
                        'canteen_items',
                        {item_id: line.item_id}
                    )
                    .then(item => {
                        m.sale_lines.findOrCreate({
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
                                fn.increment(sale_line, line.qty || 1)
                                .then(result => resolve(true))
                                .catch(err => reject(err));
                            };
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    fn.sales.lines.edit = function (_line) {
        return new Promise((resolve, reject) => {
            check_sale_line(_line.sale_line_id)
            .then(line => {
                fn.increment(line, _line.qty)
                .then(result => {
                    line.reload()
                    .then(result => {
                        if (result) {
                            if (line.qty <= 0) {
                                line.destroy()
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
            })
            .catch(err => reject(err));
        });
    };

    fn.sales.payments.delete = function (payment_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'payments',
                {payment_id: payment_id}
            )
            .then(payment => {
                if      (payment.status === 0) reject(new Error('Payment has been cancelled'))
                else if (payment.status === 2) reject(new Error('Payment has already been confirmed'))
                else if (payment.status === 1) {
                    payment.destroy()
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                } else reject(new Error('Unknown payment status'));
            })
            .catch(err => reject(err));
        });
    };
};