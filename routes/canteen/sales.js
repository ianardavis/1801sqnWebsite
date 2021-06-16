module.exports = (app, m, inc, fn) => {
    app.get('/sales/:id',        fn.loggedIn(), fn.permissions.get('access_sales'),   (req, res) => res.render('canteen/sales/show'));

    app.get('/get/sales',        fn.loggedIn(), fn.permissions.check('access_sales'), (req, res) => {
        m.sales.findAll({
            where: req.query,
            include: [
                inc.sale_lines({item: true}),
                inc.user()
            ]
        })
        .then(sales => res.send({success: true, result: sales}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/sale',         fn.loggedIn(), fn.permissions.check('access_sales'), (req, res) => {
        fn.get(
            'sales',
            req.query,
            [inc.user()]
        )
        .then(sale => res.send({success: true,  result: sale}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/sale_current', fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        m.sessions.findAll({where: {status: 1}})
        .then(sessions => {
            if (sessions.length !== 1) fn.send_error(res, `${sessions.length} session(s) open`)
            else {
                return m.sales.findOrCreate({
                    where: {
                        session_id: sessions[0].session_id,
                        user_id:    req.user.user_id,
                        status:    1
                    }
                })
                .then(([sale, created]) => res.send({success: true, result: sale.sale_id}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/sale_lines',   fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        m.sale_lines.findAll({
            where:   req.query,
            include: [inc.item()]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => fn.send_error(res, err))
    });

    app.post('/sale_lines',      fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        if (!req.body.line) fn.send_error(res, 'No line specified')
        else {
            fn.get(
                'sales',
                {sale_id: req.body.line.sale_id},
                [inc.session()]
            )
            .then(sale => {
                if (sale.session.status !== 1) fn.send_error(res, 'Session for this sale is not open')
                else {
                    return fn.get(
                        'canteen_items',
                        {item_id: req.body.line.item_id}
                    )
                    .then(item => {
                        return m.sale_lines.findOrCreate({
                            where: {
                                sale_id: sale.sale_id,
                                item_id: item.item_id
                            },
                            defaults: {
                                qty:   req.body.line.qty || 1,
                                price: item.price
                            }
                        })
                        .then(([line, created]) => {
                            if (created) res.send({success: true, message: 'Line created'})
                            else {
                                return line.increment('qty', {by: req.body.line.qty})
                                .then(result => {
                                    if (result) res.send({success: true,  message: 'Line updated'})
                                    else        fn.send_error(res, 'Line not updated');
                                })
                                .catch(err => fn.send_error(res, err));
                            };
                        })
                        .catch(err =>fn.send_error(res, err));
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        };
    });
    
    app.put('/sale_lines',       fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        if (req.body.line) {
            fn.get(
                'sale_lines',
                {sale_line_id: req.body.line.sale_line_id},
                [inc.sale({session: true})]
            )
            .then(line => {
                if (line.sale.session.status !== 1) fn.send_error(res, 'Session for this line is not open')
                else {
                    return line.increment('qty', {by: req.body.line.qty})
                    .then(result => {
                        return line.reload()
                        .then(result => {
                            if (result) {
                                if (line.qty === 0) {
                                    return line.destroy()
                                    .then(result => { 
                                        if (result) res.send({success: true,  message: 'Line updated'})
                                        else fn.send_error(res, 'Line not updated');
                                    })
                                } else res.send({success: true,  message: 'Line updated'});
                            } else fn.send_error(res, 'Line not updated');
                        })
                        .catch(err => fn.send_error(res, err))
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        } else fn.send_error(res, 'No line specified');
    });
    app.put('/sales',            fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        fn.get(
            'sales',
            {sale_id: req.body.sale_id}
        )
        .then(sale => {
            if (sale.status !== 1) fn.send_error(res, 'Sale is not open')
            else {
                return m.sale_lines.findAll({
                    where: {sale_id: sale.sale_id}
                })
                .then(lines => {
                    if (lines.length === 0) fn.send_error(res, 'No open lines on this sale');
                    else {
                        let total = 0.00;
                        lines.forEach(line => {total += line.qty * line.price});
                        return fn.sales.payment(sale.sale_id, total, req.body.sale, req.user.user_id)
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
                            .then(result => res.send({success: true, message: 'Sale completed', change: change}))
                            .catch(err => fn.send_error(res, err));
                        })
                        .catch(err => fn.send_error(res, err));
                    };
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};