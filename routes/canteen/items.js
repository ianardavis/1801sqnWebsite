const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/canteen/items',          isLoggedIn, allowed('access_canteen'),     (req, res) => {
        m.canteen_items.findAll({where: {item_id: {[op.not]: 0}}})
        .then(items => res.render('canteen/items/index', {items: items}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/items/new',      isLoggedIn, allowed('canteen_supervisor'), (req, res) => res.render('canteen/items/new'));
    app.post('/canteen/items',         isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_items.create(req.body.item)
        .then(item => {
            req.flash('success', 'Item added');
            res.redirect('/canteen/items');
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.get('/canteen/items/:id/edit', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        db.findOne({
            table: m.canteen_items,
            where: {item_id: req.params.id}
        })
        .then(item => res.render('canteen/items/edit', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.put('/canteen/items/:id',      isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        db.update({
            table: m.canteen_items,
            where: {item_id: req.params.id},
            record: req.body.item
        })
        .then(result => {
            req.flash('success', 'Item updated');
            res.redirect('/canteen/items/' + req.params.id);
        }).catch(err => res.error.redirect(err, req, res));
    });

    app.get('/canteen/items/:id',      isLoggedIn, allowed('access_canteen'),     (req, res) => {
        db.findOne({
            table: m.canteen_items,
            where: {item_id: req.params.id},
            include: [
                inc.canteen_sale_lines({as: 'sales', sale: true}),
                inc.canteen_receipt_lines({as: 'receipts', receipt: true}),
                inc.canteen_writeoff_lines({as: 'writeoffs', writeoff: true})
        ]})
        .then(item => {
            m.canteen_receipts.findOne({
                where: {
                    _complete: 0,
                    user_id: req.user.user_id
                }
            })
            .then(receipt => {
                m.canteen_writeoffs.findOne({
                    where: {
                        _complete: 0,
                        user_id: req.user.user_id
                    }
                })
                .then(writeoff => {
                    res.render('canteen/items/show', {
                        item:     item,
                        receipt:  receipt,
                        writeoff: writeoff
                    });
                })
                .catch(err => res.error.redirect(err, req, res));
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.delete('/canteen/items/:id',   isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        if (Number(req.params.id) !== 0) {
            db.destroy({
                table: m.canteen_items,
                where: {item_id: req.params.id}
            })
            .then(result => {
                req.flash('success', 'Item deleted');
                res.redirect('/canteen/items');
            })
            .catch(err => res.error.redirect(err, req, res));
        } else {
            req.flash('danger', 'This item can not be deleted');
            res.redirect('/canteen/items');
        };
    });
};