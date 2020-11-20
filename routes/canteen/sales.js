const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let canteen  = require(process.env.ROOT + '/fn/canteen'),
        settings = require(process.env.ROOT + '/fn/settings');
    app.get('/canteen/sales/:id',      permissions, allowed('access_sales'),                    (req, res) => res.render('canteen/sales/show', {tab: req.query.tab || 'details'}));

    app.get('/canteen/get/sales',      permissions, allowed('access_sales',      {send: true}), (req, res) => {
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
    app.get('/canteen/get/sale_lines', permissions, allowed('access_sale_lines', {send: true}), (req, res) => {
        m.sale_lines.findAll({
            where:   req.query,
            include: [inc.items()]
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res))
    });

    app.post('/canteen/sale_lines',    permissions, allowed('sale_line_add',     {send: true}), (req, res) => {
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
                                    _qty: req.body.line._qty,
                                    _price: item._price
                                },
                                attributes: ['line_id', '_qty']
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
    
    app.put('/canteen/sale_lines',     permissions, allowed('sale_line_edit',    {send: true}), (req, res) => {
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
                attributes: ['line_id']
            })
            .then(line => {
                if      (!line)                           res.send({result: false, message: 'Line not found'})
                else if (line.sale.session._status !== 1) res.send({result: false, message: 'Session for this line is not open'})
                else {
                    return line.increment('_qty', {by: req.body.line._qty})
                    .then(result => {
                        if (result) res.send({result: true,  message: 'Line updated'})
                        else        res.send({result: false, message: 'Line not updated'});
                    })
                    .catch(err => res.error.send(err, res));
                };
            })
            .catch(err => res.error.send(err, res));
        } else res.send({result: false, message: 'No line specified'});
    });
    app.put('/canteen/sales/:id',      permissions, allowed('sale_edit'),                       (req, res) => {
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
                    m.canteen_sales.update(
                        {_complete: 1},
                        {where: {sale_id: req.params.id}}
                    )
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
};