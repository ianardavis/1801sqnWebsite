module.exports = function (m, fn) {
    fn.sales = {lines: {}, payments: {}};
    fn.sales.find = function (where) {
        return fn.find(
            m.sales,
            where,
            [
                fn.inc.canteen.session(),
                fn.inc.canteen.sale_lines(),
                fn.inc.users.user()
            ]
        );
    };
    fn.sales.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.sales.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.canteen.sale_lines({item: true}),
                    fn.inc.users.user()
                ],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.sales.findCurrent = function (user_id) {
        return new Promise((resolve, reject) => {
            fn.sessions.findCurrent()
            .then(session => {
                m.sales.findOrCreate({
                    where: {
                        session_id: session.session_id,
                        user_id:    user_id,
                        status:     1
                    }
                })
                .then(([sale, created]) => resolve(sale.sale_id))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.sales.lines.find = function (line_id) {
        return new Promise((resolve, reject) => {
            m.sale_lines.findOne({
                where: {line_id: line_id},
                include: [fn.inc.canteen.sale({session: true})]
            })
            .then(line => {
                if (line) {
                    resolve(line);
                } else {
                    reject(new Error('Line not found'));
                };
            })
            .catch(reject);
        });
    };
    fn.sales.lines.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.sale_lines.findAndCountAll({
                where:   query.where,
                include: [fn.inc.canteen.item()],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };

    fn.sales.complete = function (sale_id, _sale, user_id) {
        function process_payments(sale_id, sale, user_id) {
            function creditAccount(user_id_credit, amount) {
                return new Promise(resolve => {
                    m.credits.findOrCreate({
                        where: {user_id: user_id_credit},
                        defaults: {credit: amount}
                    })
                    .then(([credit, created]) => {
                        if (created) {
                            resolve(0);
                        } else {
                            credit.increment('qty', {by: amount})
                            .then(result => resolve(0))
                            .catch(err => {
                                console.error(err)
                                resolve(amount);
                            });
                        };
                    })
                    .catch(err => {
                        console.error(err)
                        resolve(amount);
                    });
                });
            };
            function getSaleTotal(sale_id) {
                return new Promise((resolve, reject) => {
                    m.sale_lines.findAll({
                        where: {sale_id: sale_id}
                    })
                    .then(lines => {
                        if (lines.length === 0) {
                            reject(new Error('No open lines on this sale'));
    
                        } else {
                            let total = 0;
                            lines.forEach(line => {total += (line.qty * line.price)});
                            // let total = lines.reduce((a, b) => {a + (b.qty * b.price)});
                            resolve(total);
    
                        };
                    })
                    .catch(reject);
                });
            };
            function getPaymentTotal(sale_id) {
                return new Promise((resolve, reject) => {
                    m.payments.sum('amount', {where: {sale_id: sale_id}})
                    .then(paid => resolve(paid))
                    .catch(reject);
                });
            };
            function processAccountPayment(user_id_debit, balance, sale_id, user_id) {
                function debitAccount(sale_id, account, amount, user_id) {
                    return new Promise((resolve, reject) => {
                        account.decrement('credit', {by: amount})
                        .then(result => {
                            fn.payments.create(
                                sale_id,
                                amount,
                                user_id,
                                {
                                    type: 'Account',
                                    user_id_payment: account.user_id
                                }
                            )
                            .then(result => resolve(true))
                            .catch(reject);
                        })
                        .catch(reject);
                    });
                };
                return new Promise((resolve, reject) => {
                    fn.credits.find({credit_id: user_id_debit})
                    .then(account => {
                        if (balance <= account.credit) {
                            debitAccount(sale_id, account, balance, user_id)
                            .then(result => resolve(true))
                            .catch(reject);
                        } else {
                            debitAccount(sale_id, account, account.credit, user_id)
                            .then(result => resolve(true))
                            .catch(reject);
                        };
                    })
                    .catch(reject);
                });
            };
            function confirmPayments(sale_id) {
                return new Promise((resolve, reject) => {
                    m.payments.update({status: 2}, {where: {sale_id: sale_id, status: 1}})
                    .then(result => {
                        if (!result) {
                            reject(new Error('Payments not confirmed'));
                            
                        } else {
                            resolve(true);
                        
                        };
                    })
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                Promise.all( //Process cash payments first
                    (sale.tendered && sale.tendered > 0 ?
                        [fn.payments.create(
                            sale_id,
                            sale.tendered,
                            user_id,
                            {
                                ...(sale.user_id_payment ? {user_id_payment: sale.user_id_payment} : {})
                            }
                        )] :
                        []
                    )
                )
                .then(result => {
                    getPaymentTotal(sale_id) //Check total payments made
                    .then(paid => {
                        getSaleTotal(sale_id)
                        .then(total => {
                            let balance = Number(total - paid);
                            Promise.all(
                                (paid < total && sale.user_id_debit ? 
                                    [processAccountPayment(sale.user_id_debit, balance, sale_id, user_id)] : 
                                    []
                                )
                            )
                            .then(result => {
                                getPaymentTotal(sale_id)
                                .then(paid => {
                                    if (paid >= total) {
                                        confirmPayments(sale_id)
                                        .then(result => {
                                            if (sale.user_id_credit) {
                                                creditAccount(sale.user_id_credit, Number(paid - total))
                                                .then(change => resolve(change))
                                                .catch(err => {
                                                    console.error(err);
                                                    resolve(Number(paid - total));
                                                });
                                            } else {
                                                resolve(Number(paid - total));
                                            };
                                        })
                                        .catch(reject);
                                    } else {
                                        reject(new Error('Not enough tendered or in credit'));
                                    };
                                })
                                .catch(reject);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        };
        function subtractSoldQtyFromStock(item_id, qty) {
            return new Promise((resolve, reject) => {
                fn.canteen_items.find({item_id: item_id})
                .then(item => {
                    item.decrement('qty', {by: qty})
                    .then(result => resolve(true))
                    .catch(reject);
                })
                .catch(reject);
            });
        }
        return new Promise((resolve, reject) => {
            fn.sales.find({sale_id: sale_id})
            .then(sale => {
                if (sale.status === 0) {
                    reject(new Error('Sale has been cancelled'));

                } else if (sale.status === 2) {
                    reject(new Error('Sale has already been completed'));

                } else if (sale.status === 1) {
                    process_payments(sale.sale_id, _sale, user_id)
                    .then(change => {
                        let actions = [fn.update(sale, {status: 2})];
                        sale.lines.forEach(line => actions.push(subtractSoldQtyFromStock(line.item_id, line.qty)));
                        Promise.all(actions)
                        .then(result => resolve(change))
                        .catch(reject);
                    })
                    .catch(reject);

                } else {
                    reject(new Error('Unknown sale status'));

                };
            })
            .catch(reject);
        });
    };

    fn.sales.lines.create = function (ean, sale_id) {
        function check(sale_id) {
            return new Promise((resolve, reject) => {
                fn.sales.find({sale_id: sale_id})
                .then(sale => {
                    if (!sale.session) {
                        reject(new Error('Session not found'));
    
                    } else if (sale.session.status !== 1) {
                        reject(new Error('Session for this sale is not open'));
    
                    } else {
                        resolve(sale);
    
                    };
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            Promise.all([
                check(sale_id),
                fn.canteen_items.findByEAN(ean)
            ])
            .then(([sale, item]) => {
                m.sale_lines.findOrCreate({
                    where: {
                        sale_id: sale.sale_id,
                        item_id: item.item_id
                    },
                    defaults: {
                        qty:   1,
                        price: item.price
                    }
                })
                .then(([sale_line, created]) => {
                    if (created) {
                        resolve(true);

                    } else {
                        sale_line.increment('qty', {by: 1})
                        .then(result => resolve(true))
                        .catch(reject);

                    };
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.sales.lines.edit = function (line) {
        function check(_line) {
            return new Promise((resolve, reject) => {
                fn.sales.lines.find(_line.line_id)
                .then(line => {
                    if (!line.sale) {
                        reject(new Error('Sale not found'));
    
                    } else if (!line.sale.session) {
                        reject(new Error('Session not found'));
    
                    } else if ( line.sale.session.status !== 1) {
                        reject(new Error('Session for this sale is not open'));
    
                    } else {
                        resolve([line, _line.qty]);
    
                    };
                })
                .catch(reject);
            });
        };
        function increaseQty([line, qty]) {
            return new Promise((resolve, reject) => {
                line.increment('qty', {by: qty})
                .then(updated_line => resolve(updated_line))
                .catch(reject);
            });
        };
        function deleteIfQtyZero (line) {
            return new Promise((resolve, reject) => {
                if (line.qty <= 0) {
                    line.destroy()
                    .then(result => { 
                        if (result) {
                            resolve(true);
    
                        } else {
                            reject(new Error('Line not updated'));
    
                        };
                    })
                } else {
                    resolve(true);
    
                };
            });
        };
        return new Promise((resolve, reject) => {
            if (line) {
                check(line)
                .then(increaseQty)
                .then(deleteIfQtyZero)
                .then(resolve(true))
                .catch(reject);

            } else {
                reject(new Error('No line'));

            };
        });
    };

    fn.sales.payments.delete = function (payment_id) {
        return new Promise((resolve, reject) => {
            fn.payments.find({payment_id: payment_id})
            .then(payment => {
                if (payment.status === 0) {
                    reject(new Error('Payment has been cancelled'));

                } else if (payment.status === 2) {
                    reject(new Error('Payment has already been confirmed'));

                } else if (payment.status === 1) {
                    payment.destroy()
                    .then(result => resolve(true))
                    .catch(reject);

                } else {
                    reject(new Error('Unknown payment status'));

                };
            })
            .catch(reject);
        });
    };
};