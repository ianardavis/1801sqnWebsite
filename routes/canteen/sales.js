const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    app.get('/canteen/pos', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getSale(req, res)
        .then(sale_id => {
            fn.getAllWhere(m.canteen_items, {_current: 1})
            .then(items => {
                fn.getAllWhere(
                    m.canteen_sale_lines,
                    {sale_id: sale_id},
                    {include: [{model: m.canteen_items, as: 'item'}]}
                )
                .then(sale_items => {
                    res.render('canteen/pos', {
                        items:      items,
                        sale_items: sale_items,
                        sale_id:    sale_id
                    })
                })
                .catch(err => fn.error(err, '/canteen', req, res));
            })
            .catch(err => fn.error(err, '/canteen', req, res));
        })
    });
    app.post('/canteen/sale_lines', isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale_line) {
            fn.getSession(req, res, {redirect: true})
            .then(session_id => {
                fn.getOne(
                    m.canteen_sale_lines,
                    {
                        sale_id: req.body.sale_line.sale_id,
                        item_id: req.body.sale_line.item_id
                    },
                    {nullOK: true}
                )
                .then(line => {
                    if (!line || Number(req.body.sale_line.item_id) === 0) {
                        fn.getOne(
                            m.canteen_items,
                            {item_id: req.body.sale_line.item_id}
                        )
                        .then(item => {
                            if (Number(req.body.sale_line.item_id) !== 0) req.body.sale_line._price = item._price;
                            fn.create(
                                m.canteen_sale_lines,
                                req.body.sale_line
                            )
                            .then(sale_line => res.redirect('/canteen/pos'))
                            .catch(err =>fn.error(err, '/canteen/pos', req, res));
                        })
                        .catch(err => fn.error(err, '/canteen/pos', req, res));
                    } else {
                        let newQty = Number(line._qty) + Number(req.body.sale_line._qty)
                        if (newQty === 0) {
                            fn.delete('canteen_sale_lines', {line_id: line.line_id})
                            .then(result => res.redirect('/canteen/pos'))
                            .catch(err =>fn.error(err, '/canteen/pos', req, res));
                        } else {
                            fn.update(
                                m.canteen_sale_lines,
                                {_qty: newQty},
                                {line_id: line.line_id}
                            )
                            .then(result => res.redirect('/canteen/pos'))
                            .catch(err =>fn.error(err, '/canteen/pos', req, res));
                        };
                    };
                })
                .catch(err =>fn.error(err, '/canteen/pos', req, res));
            });
        } else {
            req.flash('danger', 'No items specified');
            res.redirect('/canteen/pos');
        };
    });
    app.put('/canteen/sale_lines', isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale_line) {
            fn.getSession(req, res, {redirect: true})
            .then(session_id => {
                fn.getOne(
                    m.canteen_sale_lines,
                    {line_id: req.body.sale_line.line_id}
                )
                .then(line => {
                    let newQty = Number(line._qty) + Number(req.body.sale_line._qty)
                    if (newQty <= 0) {
                        fn.delete('canteen_sale_lines', {line_id: line.line_id})
                        .then(result => res.redirect('/canteen/pos'))
                        .catch(err =>fn.error(err, '/canteen/pos', req, res));
                    } else {
                        fn.update(
                            m.canteen_sale_lines,
                            {_qty: newQty},
                            {line_id: line.line_id}
                        )
                        .then(result => res.redirect('/canteen/pos'))
                        .catch(err =>fn.error(err, '/canteen/pos', req, res));
                    };
                })
                .catch(err =>fn.error(err, '/canteen/pos', req, res));
            });
        } else {
            req.flash('danger', 'No items specified');
            res.redirect('/canteen/pos');
        };
    });
    app.put('/canteen/sales/:id', isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale.tendered >= req.body.sale.total) {
            fn.getAllWhere(
                m.canteen_sale_lines,
                {sale_id: req.params.id},
                {include: [
                    inc.canteen_items(),
                    inc.canteen_sales({as: 'sale'})
                ]}                    
            )
            .then(lines => {
                let actions = [];
                lines.forEach(line => {
                    actions.push(
                        fn.completeCanteenMovement('subtract', line, 'canteen_sale_lines')
                    );
                });
                actions.push(
                    fn.update(
                        m.canteen_sales,
                        {_complete: 1},
                        {sale_id: req.params.id}
                    )
                )
                Promise.allSettled(actions)
                .then(results => {
                    fn.editSetting('sale_' + req.user.user_id, -1)
                    .then(result => {
                        fn.getSale(req, res)
                        .then(sale_id => {
                            req.flash('success', 'Sale complete. Change: £' + Number(req.body.sale.tendered - req.body.sale.total).toFixed(2));
                            res.redirect('/canteen/pos');
                        })
                    })
                    .catch(err => fn.error(err, '/canteen', req, res));
                })
                .catch(err => fn.error(err, '/canteen/pos'))
            })
            .catch();
        } else {
            req.flash('danger', 'Not enough tendered');
            res.redirect('/canteen/pos')
        };
    });

    app.get('/canteen/sales/:id', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getOne(
            m.canteen_sales,
            {sale_id: req.params.id},
            {include: [
                inc.users(),
                inc.canteen_sale_lines({item: true})
            ]}
        )
        .then(sale => res.render('canteen/sales/show', {sale: sale}))
        .catch(err => fn.error(err, '/canteen', req, res));
    });
};