const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    app.get('/canteen/items',          isLoggedIn, allowed('access_canteen_items'),              (req, res) => res.render('canteen/items/index'));
    app.get('/canteen/items/:id/edit', isLoggedIn, allowed('canteen_item_edit'),                 (req, res) => {
        m.canteen_items.findOne({where: {item_id: req.params.id}})
        .then(item => res.render('canteen/items/edit', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/items/:id',      isLoggedIn, allowed('access_canteen_items'),              (req, res) => {
        m.canteen_items.findOne({
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
    
    app.put('/canteen/items/:id',      isLoggedIn, allowed('canteen_item_edit',   {send: true}), (req, res) => {
        m.canteen_items.findOne({
            where: {item_id: req.params.id},
            attributes: ['item_id']
        })
        .then(item => {
            if (item) {
                item.update(req.body.item)
                .then(result => {
                    if (result) res.send({result: true,  message: 'Item updated'})
                    else        res.send({result: false, message: 'Item not updated'})
                })
                .catch(err => res.error.send(err, res));
            } else res.send({result: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/canteen/items',         isLoggedIn, allowed('canteen_item_add',    {send: true}), (req, res) => {
        m.canteen_items.create(req.body.item)
        .then(item => res.send({result: true, message: `Item added: ${item.item_id}`}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/canteen/items/:id',   isLoggedIn, allowed('canteen_item_delete', {send: true}), (req, res) => {
        m.canteen_items.findOne({
            where: {item_id: req.params.id},
            attributes: ['item_id']
        })
        .then(item => {
            if (item) {
                if (item.item_id > 0) {
                    item.destroy()
                    .then(result => {
                        if (result) res.send({result: true,  message: 'Item deleted'})
                        else        res.send({result: false, message: 'Item not deleted'});
                    })
                    .catch(err => res.error.send(err, res));
                } else res.send({result: false, message: 'This item can not be deleted'});
            } else res.send({result: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
};