module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/sales/:id',      li, pm.get, pm.check('access_sales'),               (req, res) => res.render('canteen/sales/show'));

    app.get('/get/sales',      li,         pm.check('access_sales', {send: true}), (req, res) => {
        m.sales.findAll({
            where: req.query,
            include: [
                inc.sale_lines({item: true}),
                inc.users()
            ]
        })
        .then(sales => res.send({success: true, result: sales}))
        .catch(err => send_error(res, err))
    });
    app.get('/get/sale',       li,         pm.check('access_sales', {send: true}), (req, res) => {
        m.sales.findOne({
            where: req.query,
            include: [inc.users()]
        })
        .then(sale => {
            if (sale) res.send({success: true,  result: sale})
            else      send_error(res, 'Sale not found')
        })
        .catch(err => send_error(res, err))
    });
    app.get('/get/user_sale',  li,         pm.check('access_pos',   {send: true}), (req, res) => {
        m.sessions.findAll({
            where: {_status: 1},
            attributes: ['session_id']
        })
        .then(sessions => {
            if (sessions.length !== 1) send_error(res, `${sessions.length} session(s) open`)
            else {
                return m.sales.findOrCreate({
                    where: {
                        session_id: sessions[0].session_id,
                        user_id:    req.user.user_id,
                        _status:    1
                    }
                })
                .then(([sale, created]) => res.send({success: true, result: sale.sale_id}))
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
    app.get('/get/sale_lines', li,         pm.check('access_pos',   {send: true}), (req, res) => {
        m.sale_lines.findAll({
            where:   req.query,
            include: [inc.items()]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => send_error(res, err))
    });

    app.post('/sale_lines',    li,         pm.check('access_pos',   {send: true}), (req, res) => {
        if (!req.body.line) send_error(res, 'No line specified')
        else {
            m.sales.findOne({
                where: {sale_id: req.body.line.sale_id},
                include: [inc.sessions({attributes: ['_status']})],
                attributes: ['sale_id']
            })
            .then(sale => {
                if      (!sale)                      send_error(res, 'Sale not found')
                else if (sale.session._status !== 1) send_error(res, 'Session for this sale is not open')
                else {
                    return m.canteen_items.findOne({
                        where: {item_id: req.body.line.item_id},
                        attributes: ['item_id', 'price']
                    })
                    .then(item => {
                        if (!item) send_error(res, 'Item not found')
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
                                if (created) res.send({success: true, message: 'Line added'})
                                else {
                                    return line.increment('_qty', {by: req.body.line._qty})
                                    .then(result => {
                                        if (result) res.send({success: true,  message: 'Line updated'})
                                        else        send_error(res, 'Line not updated');
                                    })
                                    .catch(err => send_error(res, err));
                                };
                            })
                            .catch(err =>send_error(res, err));
                        };
                    })
                    .catch(err => send_error(res, err));
                };
            })
            .catch(err => send_error(res, err));
        };
    });
    
    app.put('/sale_lines',     li,         pm.check('access_pos',   {send: true}), (req, res) => {
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
                if      (!line)                           send_error(res, 'Line not found')
                else if (line.sale.session._status !== 1) send_error(res, 'Session for this line is not open')
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
                                        if (result) res.send({success: true,  message: 'Line updated'})
                                        else send_error(res, 'Line not updated');
                                    })
                                } else res.send({success: true,  message: 'Line updated'});
                            } else send_error(res, 'Line not updated');
                        })
                        .catch(err => send_error(res, err))
                    })
                    .catch(err => send_error(res, err));
                };
            })
            .catch(err => send_error(res, err));
        } else send_error(res, 'No line specified');
    });
    app.put('/sales',          li,         pm.check('access_pos',   {send: true}), (req, res) => {
        m.sales.findOne({
            where:      {sale_id: req.body.sale_id},
            attributes: ['sale_id', '_status']
        })
        .then(sale => {
            if (sale._status !== 1) send_error(res, 'Sale is not open')
            else {
                return m.sale_lines.findAll({
                    where: {
                        sale_id: sale.sale_id,
                        _status: 1
                    },
                    attributes: ['line_id', 'item_id', '_qty', '_price']
                })
                .then(lines => {
                    if (lines.length === 0) send_error(res, 'No open lines on this sale');
                    else {
                        let total = 0.00;
                        lines.forEach(line => {
                            total += line._qty * line._price;
                        });
                        if (req.body.sale.tendered < total) {
                            if (req.body.sale.user_id_debit && String(req.body.sale.user_id_debit) !== '') {
                                return m.credits.findOne({where: {user_id: req.body.sale.user_id_debit}})
                                .then(account => {
                                    if (account) {
                                        if (account._credit < (total - req.body.sale.tendered)) send_error(res, 'Not enough on account')
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
                                                            user_id: req.body.sale.user_id_debit
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
                                                    actions.push(sale.update({_status: 2}));
                                                    lines.forEach(line => {
                                                        actions.push(
                                                            m.canteen_items.findOne({
                                                                where: {item_id: line.item_id},
                                                                attributes: ['item_id', '_qty']
                                                            })
                                                            .then(item => {
                                                                return item.decrement('_qty', {by: line._qty})
                                                            })
                                                        );
                                                    })
                                                    return Promise.all(actions)
                                                    .then(result => res.send({success: true, message: 'Sale completed', change: 0.00}))
                                                    .catch(err => send_error(res, err));
                                                })
                                                .catch(err => send_error(res, err));
                                            })
                                            .catch(err => send_error(res, err));
                                        };
                                    } else send_error(res, err);
                                })
                                .catch(err => send_error(res, err));
                            } else send_error(res, 'Not enough tendered');
                        } else {
                            let actions = [],
                                change  = Number(req.body.sale.tendered - total);
                            actions.push(
                                m.sale_lines.update(
                                    {_status: 2},
                                    {where: {sale_id: sale.sale_id}}
                                )
                            );
                            actions.push(sale.update({_status: 2}));
                            actions.push(
                                m.payments.create({
                                    sale_id: sale.sale_id,
                                    _amount: Number(total),
                                })
                            );
                            lines.forEach(line => {
                                actions.push(
                                    m.canteen_items.findOne({
                                        where: {item_id: line.item_id},
                                        attributes: ['item_id', '_qty']
                                    })
                                    .then(item => {return item.decrement('_qty', {by: line._qty})})
                                );
                            });
                            if (req.body.sale.user_id_credit && String(req.body.sale.user_id_credit) !== '' && change > 0) {
                                actions.push(
                                    m.credits.findOrCreate({
                                        where:    {user_id: req.body.sale.user_id_credit},
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
                            .then(result => res.send({success: true, message: 'Sale completed', change: change}))
                            .catch(err => send_error(res, err));
                        };
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};