module.exports = (app, m, inc, fn) => {
    app.get('/canteen_items',        fn.li(), fn.permissions.get('access_canteen_items'),   (req, res) => res.render('canteen/items/index'));
    app.get('/canteen_items/:id',    fn.li(), fn.permissions.get('access_canteen_items'),   (req, res) => res.render('canteen/items/show'));
    
    app.get('/get/canteen_items',    fn.li(), fn.permissions.check('access_canteen_items'), (req, res) => {
        m.canteen_items.findAll({where: req.query})
        .then(items => res.send({success: true, result: items}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/canteen_item',     fn.li(), fn.permissions.check('access_canteen_items'), (req, res) => {
        m.canteen_items.findOne({where: req.query})
        .then(item => {
            if (item) res.send({success: true,  result: item})
            else      fn.send_error(res, 'Item not found')
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/canteen_items/:id',    fn.li(), fn.permissions.check('canteen_item_edit'),    (req, res) => {
        m.canteen_items.findOne({
            where: {item_id: req.params.id},
            attributes: ['item_id']
        })
        .then(item => {
            if (item) {
                item.update(req.body.item)
                .then(result => {
                    if (result) res.send({success: true,  message: 'Item updated'})
                    else        fn.send_error(res, 'Item not updated')
                })
                .catch(err => fn.send_error(res, err));
            } else fn.send_error(res, 'Item not found');
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/canteen_items',       fn.li(), fn.permissions.check('canteen_item_add'),     (req, res) => {
        m.canteen_items.create(req.body.item)
        .then(item => res.send({success: true, message: `Item added: ${item.item_id}`}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/canteen_items/:id', fn.li(), fn.permissions.check('canteen_item_delete'),  (req, res) => {
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
                        else        fn.send_error(res, 'Item not deleted');
                    })
                    .catch(err => fn.send_error(res, err));
                } else fn.send_error(res, 'This item can not be deleted');
            } else fn.send_error(res, 'Item not found');
        })
        .catch(err => fn.send_error(res, err));
    });
};