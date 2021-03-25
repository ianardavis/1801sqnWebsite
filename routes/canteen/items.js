module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/items',        pm.get, pm.check('access_items'),    (req, res) => res.render('canteen/items/index'));
    app.get('/items/:id',    pm.get, pm.check('access_items'),    (req, res) => res.render('canteen/items/show'));
    
    app.get('/get/items',    pm.check('access_items'),              (req, res) => {
        m.canteen_items.findAll({where: req.query})
        .then(items => res.send({success: true, result: items}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/item',     pm.check('access_items'),              (req, res) => {
        m.canteen_items.findOne({where: req.query})
        .then(item => {
            if (item) res.send({success: true,  result: item})
            else      res.send({success: false, message: 'Item not found'})
        })
        .catch(err => res.error.send(err, res));
    });

    app.put('/items/:id',    pm.check('item_edit',   {send: true}), (req, res) => {
        m.canteen_items.findOne({
            where: {item_id: req.params.id},
            attributes: ['item_id']
        })
        .then(item => {
            if (item) {
                item.update(req.body.item)
                .then(result => {
                    if (result) res.send({success: true,  message: 'Item updated'})
                    else        res.send({success: false, message: 'Item not updated'})
                })
                .catch(err => res.error.send(err, res));
            } else res.send({success: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/items',       pm.check('item_add',    {send: true}), (req, res) => {
        m.canteen_items.create(req.body.item)
        .then(item => res.send({success: true, message: `Item added: ${item.item_id}`}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/items/:id', pm.check('item_delete', {send: true}), (req, res) => {
        m.canteen_items.findOne({
            where: {item_id: req.params.id},
            attributes: ['item_id']
        })
        .then(item => {
            if (item) {
                if (item.item_id > 0) {
                    item.destroy()
                    .then(result => {
                        if (result) res.send({success: true,  message: 'Item deleted'})
                        else        res.send({success: false, message: 'Item not deleted'});
                    })
                    .catch(err => res.error.send(err, res));
                } else res.send({success: false, message: 'This item can not be deleted'});
            } else res.send({success: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
};