const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let canteen = require(process.env.ROOT + '/fn/canteen');
    app.get('/canteen/receipts',              permissions, allowed('access_receipts'),                    (req, res) => {
        m.receipts.findAll({
            include: [
                inc.receipt_lines(),
                inc.users()
            ]
        })
        .then(receipts => res.render('canteen/receipts/index', {receipts: receipts}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/receipts/:id/complete', permissions, allowed('receipt_edit'),                       (req, res) => {
        m.receipt_lines.findAll({
            where: {receipt_id: req.params.id},
            include: [
                inc.items(),
                inc.receipts({as: 'receipt'})
            ]
        })
        .then(lines => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    canteen.completeMovement({
                        m: {
                            canteen_items: m.items,
                            update: m.receipt_lines
                        },
                        action: 'increment',
                        line: line
                    })
                );
            });
            actions.push(
                m.receipts.update(
                    {_complete: 1},
                    {where: {receipt_id: req.params.id}}
                )
            );
            Promise.allSettled(actions)
            .then(results => {
                req.flash('success', 'Receipt completed');
                res.redirect('/canteen/receipts/' + req.params.id);
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/receipts/:id',          permissions, allowed('access_receipts'),                    (req, res) => {
        m.receipts.findOne({
            where: {receipt_id: req.params.id},
            include: [inc.receipt_lines()]
        })
        .then(receipt => res.render('canteen/receipts/show', {receipt: receipt}))
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/canteen/get/receipts',          permissions, allowed('access_receipts',      {send: true}), (req, res) => {
        m.receipts.findAll({
            include: [inc.users()],
            where: req.query
        })
        .then(receipts => res.send({result: true, receipts: receipts}))
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/receipt',           permissions, allowed('access_receipts',      {send: true}), (req, res) => {
        m.receipts.findOne({where: req.query})
        .then(receipt => {
            if (receipt) res.send({result: true,  receipt: receipt})
            else         res.send({result: false, message: 'Receipt not found'});
        })
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/receipt_lines',     permissions, allowed('access_receipt_lines', {send: true}), (req, res) => {
        m.receipt_lines.findAll({where: req.query})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res))
    });

    app.post('/canteen/receipts',             permissions, allowed('receipt_add',          {send: true}), (req, res) => {
        m.receipts.findOrCreate({
            where:    {_status: 1},
            defaults: {user_id: req.user.user_id}
        })
        .then(([line, created]) => {
            if (created) res.send({result: true,  message: 'Receipt created'})
            else         res.send({result: false, message: 'Receipt already open'});
        })
    
    });
    app.post('/canteen/receipt_lines',        permissions, allowed('receipt_line_add',     {send: true}), (req, res) => {
        m.receipt_lines.findOne({
            where: {
                receipt_id: req.body.line.receipt_id,
                item_id: req.body.line.item_id
            }
        })
        .then(line => {
            if (!line) {
                m.receipt_lines.create(req.body.line)
                .then(line => {
                    req.flash('success', 'Item added');
                    res.redirect('/canteen/items/' + req.body.line.item_id);
                })
                .catch(err => res.error.redirect(err, req, res));
            } else {
                req.flash('danger', 'Item already on receipt');
                res.redirect('/canteen/items/' + req.body.line.item_id);
            };
        })
    
    });

    app.put('/canteen/receipt_lines/:id',     permissions, allowed('receipt_line_edit',    {send: true}), (req, res) => {
        m.receipt_lines.update(
            req.body.line,
            {where: {line_id: req.params.id}}
        )
        .then(result => {
            req.flash('success', 'Line updated');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.put('/canteen/receipts/:id',          permissions, allowed('receipt_edit',         {send: true}), (req, res) => {
        m.receipts.update(
            req.body.receipt,
            {where: {receipt_id: req.params.id}}
        )
        .then(result => {
            req.flash('success', 'Receipt updated');
            res.redirect('/canteen/receipts/' + req.params.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.delete('/canteen/receipt_lines/:id',  permissions, allowed('receipt_line_delete',  {send: true}), (req, res) => {
        m.receipt_lines.destroy({where: {line_id: req.params.id}})
        .then(result => {
            req.flash('success', 'Line removed');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.delete('/canteen/receipts/:id',       permissions, allowed('receipt_delete',       {send: true}), (req, res) => {
        m.receipts.destroy({where: {receipt_id: req.params.id}})
        .then(result => {
            req.flash('success', 'Receipt deleted');
            res.redirect('/canteen');
        })
        .catch(err => res.error.redirect(err, req, res));
    });
};