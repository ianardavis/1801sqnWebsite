const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db      = require(process.env.ROOT + '/fn/db'),
        canteen = require(process.env.ROOT + '/fn/canteen');
    app.get('/canteen/receipts',              isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_receipts.findAll({
            include: [
                inc.canteen_receipt_lines(),
                inc.users()
            ]
        })
        .then(receipts => res.render('canteen/receipts/index', {receipts: receipts}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/receipts/new',          isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_receipts.findOne({
            where: {
                _complete: 0,
                user_id: req.user.user_id
            }
        })
        .then(receipt => {
            if (!receipt) {
                m.canteen_receipts.create({user_id: req.user.user_id})
                .then(new_receipt => {
                    req.flash('success', 'Receipt created: ' + new_receipt.receipt_id);
                    res.redirect('/canteen/receipts');
                })
                .catch(err => res.error.redirect(err, req, res));
            } else {
                req.flash('success', 'Receipt already open: ' + receipt.receipt_id);
                res.redirect('/canteen/receipts');
            };
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/receipts/:id',          isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        db.findOne({
            table: m.canteen_receipts,
            where: {receipt_id: req.params.id},
            include: [inc.canteen_receipt_lines()]
        })
        .then(receipt => res.render('canteen/receipts/show', {receipt: receipt}))
        .catch(err => res.error.redirect(err, req, res));
    });

    app.post('/canteen/receipt_lines',        isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_receipt_lines.findOne({
            where: {
                receipt_id: req.body.line.receipt_id,
                item_id: req.body.line.item_id
            }
        })
        .then(line => {
            if (!line) {
                m.canteen_receipt_lines.create(req.body.line)
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

    app.put('/canteen/receipt_lines/:id',     isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        db.update({
            table: m.canteen_receipt_lines,
            where: {line_id: req.params.id},
            record: req.body.line
        })
        .then(result => {
            req.flash('success', 'Line updated');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/receipts/:id/complete', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_receipt_lines.findAll({
            where: {receipt_id: req.params.id},
            include: [
                inc.canteen_items(),
                inc.canteen_receipts({as: 'receipt'})
            ]
        })
        .then(lines => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    canteen.completeMovement({
                        m: {
                            canteen_items: m.canteen_items,
                            update: m.canteen_receipt_lines
                        },
                        action: 'increment',
                        line: line
                    })
                );
            });
            actions.push(
                db.update({
                    table: m.canteen_receipts,
                    where: {receipt_id: req.params.id},
                    record: {_complete: 1}
                })
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
    app.put('/canteen/receipts/:id',          isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        db.update({
            table: m.canteen_receipts,
            where: {receipt_id: req.params.id},
            record: req.body.receipt
        })
        .then(result => {
            req.flash('success', 'Receipt updated');
            res.redirect('/canteen/receipts/' + req.params.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.delete('/canteen/receipt_lines/:id',  isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        db.destroy({
            table: m.canteen_receipt_lines,
            where: {line_id: req.params.id}
        })
        .then(result => {
            req.flash('success', 'Line removed');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.delete('/canteen/receipts/:id',       isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        db.destroy({
            table: m.canteen_receipts,
            where: {receipt_id: req.params.id}
        })
        .then(result => {
            req.flash('success', 'Receipt deleted');
            res.redirect('/canteen');
        })
        .catch(err => res.error.redirect(err, req, res));
    });
};