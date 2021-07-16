module.exports = (app, m, fn) => {
    app.get('/get/categories',    fn.loggedIn(), fn.permissions.check('access_categories'), (req, res) => {
        for (let [key, value] of Object.entries(req.query)) {
            if (value === '') req.query[key] = null;
        };
        m.categories.findAll({
            where: req.query,
            include: [fn.inc.stores.categories({as: 'parent'})]
        })
        .then(categories => res.send({success: true, result: categories}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/category',      fn.loggedIn(), fn.permissions.check('access_categories'), (req, res) => {
        for (let [key, value] of Object.entries(req.query)) {
            if (value === '') req.query[key] = null;
        };
        fn.get(
            'categories',
            req.query,
            [fn.inc.stores.categories({as: 'parent'})]
        )
        .then(category => res.send({success: true, result: category}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/categories',        fn.loggedIn(), fn.permissions.check('category_edit'),     (req, res) => {
        if (req.body.category.parent_category_id === '') req.body.category.parent_category_id = null;
        fn.put(
            'categories',
            {category_id: req.body.category_id},
            req.body.category
        )
        .then(result => res.send({success: true, message: 'Category updated'}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/categories',       fn.loggedIn(), fn.permissions.check('category_add'),      (req, res) => {
        if (req.body.category.parent_category_id === '') delete req.body.category.parent_category_id;
        m.categories.create({...req.body.category, ...{user_id: req.user.user_id}})
        .then(category => res.send({success: true, message: 'Category created'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/categories/:id', fn.loggedIn(), fn.permissions.check('category_delete'),   (req, res) => {
        fn.get(
            'categories',
            {category_id: req.params.id},
            ['category_id']
        )
        .then(category => {
            return m.item_categories.destroy(
                {where: {category_id: category.category_id}}
            )
            .then(result => {
                return category.destroy()
                .then(result => {
                    if (!result) fn.send_error(res, 'Category not deleted')
                    else         res.send({success: true,  message: 'Category deleted'})
                })
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};