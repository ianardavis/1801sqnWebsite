const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        canteen  = require(process.env.ROOT + '/fn/canteen'),
        settings = require(process.env.ROOT + '/fn/settings');
    app.get('/canteen/pos',         isLoggedIn, allowed('access_canteen'), (req, res) => {
        canteen.getSale(req, res)
        .then(sale_id => {
            m.canteen_items.findAll({where: {_current: 1}})
            .then(items => {
                m.canteen_sale_lines.findAll({
                    where: {sale_id: sale_id},
                    include: [{model: m.canteen_items, as: 'item'}]
                })
                .then(sale_items => {
                    res.render('canteen/pos', {
                        items:      items,
                        sale_items: sale_items,
                        sale_id:    sale_id
                    })
                })
                .catch(err => res.error.redirect(err, req, res));
            })
            .catch(err => res.error.redirect(err, req, res));
        })
    });
    app.post('/canteen/sale_lines', isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale_line) {
            canteen.getSession(req, res, {redirect: true})
            .then(session_id => {
                m.canteen_sale_lines.findOne({
                    where: {
                        sale_id: req.body.sale_line.sale_id,
                        item_id: req.body.sale_line.item_id
                    }
                })
                .then(line => {
                    if (!line || Number(req.body.sale_line.item_id) === 0) {
                        db.findOne({
                            table: m.canteen_items,
                            where: {item_id: req.body.sale_line.item_id}
                        })
                        .then(item => {
                            if (Number(req.body.sale_line.item_id) !== 0) req.body.sale_line._price = item._price;
                            m.canteen_sale_lines.create(req.body.sale_line)
                            .then(sale_line => res.redirect('/canteen/pos'))
                            .catch(err =>res.error.redirect(err, req, res));
                        })
                        .catch(err => res.error.redirect(err, req, res));
                    } else {
                        let newQty = Number(line._qty) + Number(req.body.sale_line._qty)
                        if (newQty === 0) {
                            db.destroy({
                                table: m.canteen_sale_lines,
                                where: {line_id: line.line_id}
                            })
                            .then(result => res.redirect('/canteen/pos'))
                            .catch(err =>res.error.redirect(err, req, res));
                        } else {
                            db.update({
                                table: m.canteen_sale_lines,
                                where: {line_id: line.line_id},
                                record: {_qty: newQty}
                            })
                            .then(result => res.redirect('/canteen/pos'))
                            .catch(err =>res.error.redirect(err, req, res));
                        };
                    };
                })
                .catch(err =>res.error.redirect(err, req, res));
            });
        } else {
            req.flash('danger', 'No items specified');
            res.redirect('/canteen/pos');
        };
    });
    app.put('/canteen/sale_lines',  isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale_line) {
            canteen.getSession(req, res, {redirect: true})
            .then(session_id => {
                db.findOne({
                    table: m.canteen_sale_lines,
                    where: {line_id: req.body.sale_line.line_id}
                })
                .then(line => {
                    let newQty = Number(line._qty) + Number(req.body.sale_line._qty)
                    if (newQty <= 0) {
                        db.destroy({
                            table: m.canteen_sale_lines,
                            where: {line_id: line.line_id}
                        })
                        .then(result => res.redirect('/canteen/pos'))
                        .catch(err =>res.error.redirect(err, req, res));
                    } else {
                        db.update({
                            table: m.canteen_sale_lines,
                            where: {line_id: line.line_id},
                            record: {_qty: newQty}
                        })
                        .then(result => res.redirect('/canteen/pos'))
                        .catch(err =>res.error.redirect(err, req, res));
                    };
                })
                .catch(err =>res.error.redirect(err, req, res));
            });
        } else {
            req.flash('danger', 'No items specified');
            res.redirect('/canteen/pos');
        };
    });
    app.put('/canteen/sales/:id',   isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale.tendered >= req.body.sale.total) {
            m.canteen_sale_lines.findAll({
                where: {sale_id: req.params.id},
                include: [
                    inc.canteen_items(),
                    inc.canteen_sales({as: 'sale'})
                ]
            })
            .then(lines => {
                let actions = [];
                lines.forEach(line => {
                    actions.push(
                        canteen.completeMovement({
                            m: {
                                canteen_items: m.canteen_items,
                                update: m.canteen_sale_lines
                            },
                            action: 'decrement',
                            line: line
                        })
                    );
                });
                actions.push(
                    db.update({
                        table: m.canteen_sales,
                        where: {sale_id: req.params.id},
                        record: {_complete: 1}
                    })
                )
                Promise.allSettled(actions)
                .then(results => {
                    settings.edit({
                        m: {settings: m.settings},
                        name: 'sale_' + req.user.user_id,
                        value: -1
                    })
                    .then(result => {
                        canteen.getSale(req, res)
                        .then(sale_id => {
                            req.flash('success', 'Sale complete. Change: £' + Number(req.body.sale.tendered - req.body.sale.total).toFixed(2));
                            res.redirect('/canteen/pos');
                        })
                    })
                    .catch(err => res.error.redirect(err, req, res));
                })
                .catch(err => res.error.redirect(err, req, res))
            })
            .catch();
        } else {
            req.flash('danger', 'Not enough tendered');
            res.redirect('/canteen/pos')
        };
    });

    app.get('/canteen/sales/:id',   isLoggedIn, allowed('access_canteen'), (req, res) => {
        db.findOne({
            table: m.canteen_sales,
            where: {sale_id: req.params.id},
            include: [
                inc.users(),
                inc.canteen_sale_lines({item: true})
            ]
        })
        .then(sale => res.render('canteen/sales/show', {sale: sale}))
        .catch(err => res.error.redirect(err, req, res));
    });
};