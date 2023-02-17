module.exports = (app, fn) => {
    app.get('/get/categories',    fn.loggedIn(), fn.permissions.check('access_stores'),        (req, res) => {
        if (req.query.where.category_id_parent === "") { 
            req.query.where.category_id_parent = {[fn.op.is]: null};
        };
        fn.categories.getAll(req.query)
        .then(results => fn.send_res('categories', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/category',      fn.loggedIn(), fn.permissions.check('access_stores'),        (req, res) => {
        for (let [key, value] of Object.entries(req.query)) {
            if (value === '') req.query[key] = null;
        };
        fn.categories.get(req.query.where)
        .then(category => res.send({success: true, result: category}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/categories',        fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.categories.edit(req.body.category_id, req.body.category)
        .then(result => res.send({success: result, message: `Category ${(result ? '' : 'not ')}updated`}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/categories',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.categories.create(req.body.category, req.user.user_id)
        .then(category => res.send({success: true, message: 'Category created'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/categories/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.categories.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Category deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};