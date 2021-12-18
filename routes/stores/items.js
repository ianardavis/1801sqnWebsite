module.exports = (app, m, fn) => {
    app.get('/items',                  fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/items/index'));
    app.get('/items/:id',              fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/items/show'));
    
    app.get('/get/items/supplier',     fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.items.findAll({
            include: [{
                model: m.sizes,
                where: req.query.where
            }],
            ...fn.pagination(req.query)
        })
        .then(items => {
            console.log(req.query.where);
            delete items.sizes;
            res.send({success: true, result: items});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/items/uniform',      fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.items.findAll({
            include: [{
                model: m.item_categories,
                required: true,
                include: [{
                    model: m.categories,
                    where: {category: 'Uniform'},
                    required: true
                }]
            }],
            ...fn.pagination(req.query)
        })
        .then(items => res.send({success: true, result: items}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/items',              fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.items.findAll({
            where:   req.query.where,
            include: [fn.inc.stores.gender()],
            ...fn.pagination(req.query)
        })
        .then(items => res.send({success: true, result: items}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item',               fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.get(
            'items',
            req.query.where,
            [m.genders]
        )
        .then(item => res.send({success: true, result: item}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item_categories',    fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.item_categories.findAll({
            where:   req.query.where,
            include: [fn.inc.stores.category()],
            ...fn.pagination(req.query)
        })
        .then(categories => res.send({success: true, result: categories}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item_category',      fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.get(
            'item_categories',
            req.query.where,
            [m.categories]
        )
        .then(category => res.send({success: true, result: category}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/items',                 fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        req.body.item = fn.nullify(req.body.item);
        m.items.create(req.body.item)
        .then(item => res.send({success: true, message: 'Item added'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/item_categories',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        let actions = [];
        req.body.category.category_id.filter(e => e !== '').forEach(category_id => {
            actions.push(new Promise((resolve, reject) => {
                return m.item_categories.findOrCreate({
                    where: {
                        item_id:     req.body.category.item_id,
                        category_id: category_id
                    }
                })
                .then(([category, created]) => resolve(true))
                .catch(err => reject(err));
            }));
        });
        Promise.allSettled(actions)
        .then(results => res.send({success: true, message: 'Categories added'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/items/:id',              fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.put(
            'items',
            {item_id: req.params.id},
            req.body.item
        )
        .then(result => res.send({success: true, message: 'Item saved'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/items/:id',           fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.sizes.findOne({where: {item_id: req.params.id}})
        .then(sizes => {
            if (sizes) fn.send_error(res, 'Cannot delete item while it has sizes assigned')
            else {
                return m.items.destroy({where: {item_id: req.params.id}})
                .then(result => {
                    if (!result) fn.send_error(res, 'Item not deleted')
                    else res.send({success: true, message: 'Item deleted'});
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/item_categories/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.item_categories.destroy({where: {item_category_id: req.params.id}})
        .then(result => {
            if (!result) fn.send_error(res, 'Category not deleted')
            else res.send({success: true, message: 'Category deleted'});
        })
        .catch(err => fn.send_error(res, err));
    });
};