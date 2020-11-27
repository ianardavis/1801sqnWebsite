const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/sales/:id',      permissions, allowed('access_sales'),               (req, res) => res.render('canteen/sales/show', {tab: req.query.tab || 'details'}));

    app.get('/canteen/get/sales',      permissions, allowed('access_sales', {send: true}), (req, res) => {
        m.sales.findAll({
            where: req.query,
            include: [
                inc.sale_lines({item: true}),
                inc.users()
            ]
        })
        .then(sales => res.send({result: true, sales: sales}))
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/sale',       permissions, allowed('access_sales', {send: true}), (req, res) => {
        m.sales.findOne({
            where: req.query,
            include: [inc.users()]
        })
        .then(sale => {
            if (sale) res.send({result: true,  sale: sale})
            else      res.send({result: false, message: 'Sale not found'})
        })
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/user_sale',  permissions, allowed('access_pos',   {send: true}), (req, res) => {
        m.sessions.findAll({
            where: {_status: 1},
            attributes: ['session_id']
        })
        .then(sessions => {
            if (sessions.length !== 1) res.send({result: false, message: `${sessions.length} session(s) open`})
            else {
                return m.sales.findOrCreate({
                    where: {
                        session_id: sessions[0].session_id,
                        user_id:    req.user.user_id,
                        _status:    1
                    }
                })
                .then(([sale, created]) => res.send({result: true, user_sale: sale.sale_id}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/canteen/get/sale_lines', permissions, allowed('access_pos',   {send: true}), (req, res) => {
        m.sale_lines.findAll({
            where:   req.query,
            include: [inc.items()]
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res))
    });

    app.post('/canteen/sale_lines',    permissions, allowed('access_pos',   {send: true}), (req, res) => {
        if (req.body.line) {
            m.sales.findOne({
                where: {sale_id: req.body.line.sale_id},
                include: [inc.sessions({attributes: ['_status']})],
                attributes: ['sale_id']
            })
            .then(sale => {
                if      (!sale)                      res.send({result: false, message: 'Sale not found'})
                else if (sale.session._status !== 1) res.send({result: false, message: 'Session for this sale is not open'})
                else {
                    return m.items.findOne({
                        where: {item_id: req.body.line.item_id},
                        attributes: ['item_id', '_price']
                    })
                    .then(item => {
                        if (!item) res.send({result: false, message: 'Item not found'})
                        else {
                            return m.sale_lines.findOrCreate({
                                where: {
                                    sale_id: sale.sale_id,
                                    item_id: item.item_id
                                },
                                defaults: {
                                    _qty:   req.body.line._qty || 1,
                                    _price: item._price
                                }
                            })
                            .then(([line, created]) => {
                                if (created) res.send({result: true, message: 'Line added'})
                                else {
                                    return line.increment('_qty', {by: req.body.line._qty})
                                    .then(result => {
                                        if (result) res.send({result: true, message: 'Line updated'})
                                        else res.send({result: false, message: 'Line not updated'});
                                    })
                                    .catch(err => res.error.send(err, res));
                                };
                            })
                            .catch(err =>res.error.send(err, res));
                        };
                    })
                    .catch(err => res.error.send(err, res));
                };
            })
            .catch(err => res.error.send(err, res));
        } else res.send({result: false, message: 'No line specified'});
    });
    
    app.put('/canteen/sale_lines',     permissions, allowed('access_pos',   {send: true}), (req, res) => {
        if (req.body.line) {
            m.sale_lines.findOne({
                where: {line_id: req.body.line.line_id},
                include: [
                    inc.sales({
                        as:         'sale',
                        include:    [inc.sessions({attributes: ['_status']})],
                        attributes: ['sale_id']
                    })
                ],
                attributes: ['line_id', '_qty']
            })
            .then(line => {
                if      (!line)                           res.send({result: false, message: 'Line not found'})
                else if (line.sale.session._status !== 1) res.send({result: false, message: 'Session for this line is not open'})
                else {
                    return line.increment('_qty', {by: req.body.line._qty})
                    .then(result => {
                        return line.reload()
                        .then(result => {
                            if (result) {
                                if (line._qty === 0) {
                                    let actions = [];
                                    actions.push(line.destroy());
                                    return Promise.all(actions)
                                    .then(result => { 
                                        if (result) res.send({result: true,  message: 'Line updated'})
                                        else res.send({result: false, message: 'Line not updated'});
                                    })
                                } else res.send({result: true,  message: 'Line updated'});
                            } else res.send({result: false, message: 'Line not updated'});
                        })
                        .catch(err => res.error.send(err, res))
                    })
                    .catch(err => res.error.send(err, res));
                };
            })
            .catch(err => res.error.send(err, res));
        } else res.send({result: false, message: 'No line specified'});
    });
    app.put('/canteen/sales',          permissions, allowed('access_pos',   {send: true}), (req, res) => {
        m.sales.findOne({
            where:      {sale_id: req.body.sale_id},
            attributes: ['sale_id', '_status']
        })
        .then(sale => {
            if (sale._status !== 1) res.send({result: false, message: 'Sale is not open'})
            else {
                return m.sale_lines.findAll({
                    where: {
                        sale_id: sale.sale_id,
                        _status: 1
                    },
                    attributes: ['line_id', 'item_id', '_qty', '_price']
                })
                .then(lines => {
                    if (lines.length === 0) {
                        res.send({result: false, message: 'No open lines on this sale'});
                    } else {
                        let total = 0.00;
                        lines.forEach(line => {
                            total += line._qty * line._price;
                        });
                        if (req.body.sale.tendered < total) {
                            if (req.body.sale.debit_user_id && String(req.body.sale.debit_user_id) !== '') {
                                return m.credits.findOne({where: {user_id: req.body.sale.debit_user_id}})
                                .then(account => {
                                    if (account) {
                                        if (account._credit < (total - req.body.sale.tendered)) res.send({result: false, message: 'Not enough on account'})
                                        else {
                                            let debit_amount = Number(total - req.body.sale.tendered)
                                            return account.decrement('_credit', {by: debit_amount})
                                            .then(result => {
                                                return account.reload()
                                                .then(updated_account => {
                                                    let actions = [];
                                                    if (updated_account._credit === '0.00') actions.push(updated_account.destroy());
                                                    actions.push(
                                                        m.payments.create({
                                                            sale_id: sale.sale_id,
                                                            _amount: debit_amount,
                                                            _type: 'Debit',
                                                            user_id: req.body.sale.debit_user_id
                                                        })
                                                    );
                                                    if (Number(req.body.sale.tendered) > 0) {
                                                        actions.push(
                                                            m.payments.create({
                                                                sale_id: sale.sale_id,
                                                                _amount: Number(req.body.sale.tendered),
                                                            })
                                                        );
                                                    };
                                                    actions.push(
                                                        m.sale_lines.update(
                                                            {_status: 2},
                                                            {where: {sale_id: sale.sale_id}}
                                                        )
                                                    );
                                                    actions.push(
                                                        sale.update({_status: 2})
                                                    );
                                                    lines.forEach(line => {
                                                        actions.push(
                                                            m.items.findOne({
                                                                where: {item_id: line.item_id},
                                                                attributes: ['item_id', '_qty']
                                                            })
                                                            .then(item => {
                                                                return item.decrement('_qty', {by: line._qty})
                                                            })
                                                        );
                                                    })
                                                    return Promise.all(actions)
                                                    .then(result => res.send({result: true, message: 'Sale completed', change: 0.00}))
                                                    .catch(err => res.error.send(err, res));
                                                })
                                                .catch(err => res.error.send(err, res));
                                            })
                                            .catch(err => res.error.send(err, res));
                                        };
                                    } else res.error.send(err, res);
                                })
                                .catch(err => res.error.send(err, res));
                            } else res.send({result: false, message: 'Not enough tendered'});
                        } else {
                            let actions = [],
                                change  = Number(req.body.sale.tendered - total);
                            actions.push(
                                m.sale_lines.update(
                                    {_status: 2},
                                    {where: {sale_id: sale.sale_id}}
                                )
                            );
                            actions.push(
                                sale.update({_status: 2})
                            );
                            actions.push(
                                m.payments.create({
                                    sale_id: sale.sale_id,
                                    _amount: Number(total),
                                })
                            );
                            lines.forEach(line => {
                                actions.push(
                                    m.items.findOne({
                                        where: {item_id: line.item_id},
                                        attributes: ['item_id', '_qty']
                                    })
                                    .then(item => {return item.decrement('_qty', {by: line._qty})})
                                );
                            });
                            if (req.body.sale.credit_user_id && String(req.body.sale.credit_user_id) !== '' && change > 0) {
                                actions.push(
                                    m.credits.findOrCreate({
                                        where:    {user_id: req.body.sale.credit_user_id},
                                        defaults: {_credit: change}
                                    })
                                    .then(([credit, created]) => {
                                        if (!created) {
                                            return credit.increment('_credit', {by: change})
                                            .then(result => {
                                                return m.payments.create({
                                                    sale_id: sale.sale_id,
                                                    _amount: change,
                                                    _type: 'Credit',
                                                    user_id: credit.user_id
                                                })
                                                .then(result => change = 0);
                                            });
                                        };
                                    })
                                );
                            };
                            return Promise.all(actions)
                            .then(result => res.send({result: true, message: 'Sale completed', change: change}))
                            .catch(err => res.error.send(err, res));
                        };
                    };
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};