module.exports = (app, m, fn) => {
    app.get('/canteen_items',        fn.loggedIn(), fn.permissions.get('access_canteen_items'),   (req, res) => res.render('canteen/items/index'));
    app.get('/canteen_items/:id',    fn.loggedIn(), fn.permissions.get('access_canteen_items'),   (req, res) => res.render('canteen/items/show'));
    
    app.get('/get/canteen_items',    fn.loggedIn(), fn.permissions.check('access_canteen_items'), (req, res) => {
        m.canteen_items.findAll({where: req.query})
        .then(items => res.send({success: true, result: items}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/canteen_item',     fn.loggedIn(), fn.permissions.check('access_canteen_items'), (req, res) => {
        fn.get(
            'canteen_items',
            req.query
        )
        .then(item => res.send({success: true,  result: item}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/canteen_items/:id',    fn.loggedIn(), fn.permissions.check('canteen_item_edit'),    (req, res) => {
        if (!req.body.item) fn.send_error(res, 'No item')
        else {
            fn.canteen_items.edit(req.params.id, req.body.item)
            .then(result => res.send({success: true,  message: 'Item updated'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    
    app.post('/canteen_items',       fn.loggedIn(), fn.permissions.check('canteen_item_add'),     (req, res) => {
        if (!req.body.item) fn.send_error(res, 'No item')
        else {
            fn.canteen_items.create(req.body.item)
            .then(item => res.send({success: true, message: 'Item added'}))
            .catch(err => fn.send_error(res, err));
        };
    });

    app.delete('/canteen_items/:id', fn.loggedIn(), fn.permissions.check('canteen_item_delete'),  (req, res) => {
        fn.canteen_items.delete(req.params.id)
        .then(result => res.send({success: true,  message: 'Item deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};