module.exports = (app, m, inc, fn) => {
    app.get('/get/categories',    fn.li(), fn.permissions.check('access_categories', {send: true}), (req, res) => {
        for (let [key, value] of Object.entries(req.query)) {
            if (value === '') req.query[key] = null;
        };
        m.categories.findAll({
            where: req.query,
            include: [inc.categories({as: 'parent'})]
        })
        .then(categories => res.send({success: true, result: categories}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/category',      fn.li(), fn.permissions.check('access_categories', {send: true}), (req, res) => {
        for (let [key, value] of Object.entries(req.query)) {
            if (value === '') req.query[key] = null;
        };
        m.categories.findOne({
            where: req.query,
            include: [inc.categories({as: 'parent'})]
        })
        .then(category => {
            if (!category) fn.send_error(res, 'Category not found')
            else           res.send({success: true, result: category})
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/categories',        fn.li(), fn.permissions.check('category_edit',     {send: true}), (req, res) => {
        if (req.body.category.parent_category_id === '') req.body.category.parent_category_id = null;
        m.categories.update(
            req.body.category,
            {where: {category_id: req.body.category_id}}
        )
        .then(result => {
            if (!result) res.send({success: true, message: 'Category not updated'})
            else         res.send({success: true, message: 'Category updated'});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/categories',       fn.li(), fn.permissions.check('category_add',      {send: true}), (req, res) => {
        if (req.body.category.parent_category_id === '') delete req.body.category.parent_category_id;
        m.categories.create({...req.body.category, ...{user_id: req.user.user_id}})
        .then(category => res.send({success: true, message: 'Category created'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/categories/:id', fn.li(), fn.permissions.check('category_delete',   {send: true}), (req, res) => {
        m.categories.findOne({
            where:      {category_id: req.params.id},
            attributes: ['category_id']
        })
        .then(category => {
            if (!category) fn.send_error(res, 'Category not found')
            else {
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
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};