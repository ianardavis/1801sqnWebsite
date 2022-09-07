module.exports = (app, m, fn) => {
    let op = require('sequelize').Op;
    app.get('/items',                  fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/items/index'));
    app.get('/items/:id',              fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/items/show'));
    
    app.get('/get/items/supplier',     fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.items.findAndCountAll({
            include: [{
                model: m.sizes,
                where: req.query.where
            }],
            ...fn.pagination(req.query)
        })
        .then(results => {console.log(results);fn.send_res('items', res, results, req.query)})
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/items/uniform',      fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.items.findAndCountAll({
            include: [{
                model: m.item_categories,
                required: true,
                include: [{
                    model: m.categories,
                    where: {category: 'Uniform'}
                }]
            }],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('items', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/items',              fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        let where = req.query.where || {};
        if (req.query.like) where.description = {[op.substring]: req.query.like.description || ''}
        m.items.findAndCountAll({
            where:   where,
            include: [fn.inc.stores.gender()],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('items', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item',               fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.items.findOne({
            where: req.query.where,
            include: [m.genders]
        })
        .then(item => {
            if (item) res.send({success: true, result: item})
            else res.send({success: false, message: 'Item not found'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item_categories',    fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.item_categories.findAndCountAll({
            where:   req.query.where,
            include: [fn.inc.stores.category()],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('categories', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/item_category',      fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.item_categories.findOne({
            where: req.query.where,
            include: [m.categories]
        })
        .then(category => {
            if (category) res.send({success: true, result: category})
            else res.send({success: false, message: 'Category not found'});
        })
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
                m.item_categories.findOrCreate({
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
        fn.items.edit(req.params.id, req.body.item)
        .then(result => res.send({success: result, message: `Item ${(result ? '' : 'not ')}saved`}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/items/:id',           fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.sizes.findOne({where: {item_id: req.params.id}})
        .then(sizes => {
            if (sizes) fn.send_error(res, 'Cannot delete item while it has sizes assigned')
            else {
                m.items.destroy({where: {item_id: req.params.id}})
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