module.exports = (app, fn) => {
    app.get('/canteen_items',        fn.loggedIn(), fn.permissions.get('access_canteen'),        (req, res) => res.render('canteen/items/index'));
    app.get('/canteen_items/:id',    fn.loggedIn(), fn.permissions.get('access_canteen'),        (req, res) => res.render('canteen/items/show'));
    
    app.get('/get/canteen_items',    fn.loggedIn(), fn.permissions.check('access_canteen'),      (req, res) => {
        fn.canteen_items.get_all(req.query.where, fn.pagination(req.query))
        .then(results => fn.send_res('items', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/canteen_item',     fn.loggedIn(), fn.permissions.check('access_canteen'),      (req, res) => {
        fn.canteen_items.get(req.query.where)
        .then(item => res.send({success: true, result: item}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/canteen_items/:id',    fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.canteen_items.edit(req.params.id, req.body.item)
        .then(result => res.send({success: result, message: 'Item updated'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/canteen_items',       fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.canteen_items.create(req.body.item)
        .then(item => res.send({success: true, message: 'Item added'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/canteen_items/:id', fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.canteen_items.delete(req.params.id)
        .then(result => res.send({success: true,  message: 'Item deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};