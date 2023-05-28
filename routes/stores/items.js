module.exports = (app, fn) => {
    app.get('/items',                  fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/items/index'));
    app.get('/items/:id',              fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/items/show'));
    
    app.get('/get/items/supplier',     fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.items.get_for_supplier(
            req.query.where,
            fn.pagination(req.query)
        )
        .then(items => fn.send_res('items', res, items, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/items/uniform',      fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.items.get_uniform(fn.pagination(req.query))
        .then(items => fn.send_res('items', res, items, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/items',              fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.items.get_all(req.query)
        .then(items => fn.send_res('items', res, items, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item',               fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.items.get(req.query.where)
        .then(item => res.send({success: true, result: item}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item_categories',    fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.items.categories.get_all(req.query)
        .then(categories => fn.send_res('categories', res, categories, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item_category',      fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.items.categories.get(req.query.where)
        .then(category => res.send({success: true, result: category}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/items',                 fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.items.create(req.body.item)
        .then(item => res.send({success: true, message: 'Item added'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/item_categories',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        let actions = [];
        req.body.category.category_id.filter(e => e !== '').forEach(category_id => {
            actions.push(fn.items.categories.create(req.body.category.item_id, category_id));
        });
        Promise.allSettled(actions)
        .then(results => res.send({success: true, message: 'Categories added'}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/items/:id',              fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.items.edit(req.params.id, req.body.item)
        .then(result => res.send({success: result, message: `Item ${(result ? '' : 'not ')}saved`}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/items/:id',           fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.items.delete(req.params.id)
        .then(sizes => res.send({success: true, message: 'Item deleted'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/item_categories/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.items.categories.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Category deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};