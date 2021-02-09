module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/get/categories',    pm, al('access_categories', {send: true}), (req, res) => {
        for (let [key, value] of Object.entries(req.query)) {
            if (value === '') req.query[key] = null;
        };
        m.stores.categories.findAll({
            where: req.query,
            include: [inc.categories({as: 'parent'})]
        })
        .then(categories => res.send({success: true, result: categories}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting categories: ${err.message}`});
        });
    });
    app.get('/stores/get/category',      pm, al('access_categories', {send: true}), (req, res) => {
        for (let [key, value] of Object.entries(req.query)) {
            if (value === '') req.query[key] = null;
        };
        m.stores.categories.findOne({
            where: req.query,
            include: [
                inc.categories({as: 'parent'}),
                inc.users()
            ]
        })
        .then(category => {
            if (!category) res.send({success: false, message: 'Category not found'})
            else           res.send({success: true, result: category})
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting category: ${err.message}`});
        });
    });

    app.put('/stores/categories',        pm, al('category_edit',     {send: true}), (req, res) => {
        if (req.body.category.parent_category_id === '') req.body.category.parent_category_id = null;
        m.stores.categories.update(
            req.body.category,
            {where: {category_id: req.body.category_id}}
        )
        .then(result => {
            if (!result) res.send({success: true, message: 'Category not updated'})
            else         res.send({success: true, message: 'Category updated'});
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error updating category: ${err.message}`});
        });
    });

    app.post('/stores/categories',       pm, al('category_add',      {send: true}), (req, res) => {
        if (req.body.category.parent_category_id === '') delete req.body.category.parent_category_id;
        m.stores.categories.create({...req.body.category, ...{user_id: req.user.user_id}})
        .then(category => res.send({success: true, message: 'Category created'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error creating category: ${err.message}`});
        });
    });

    app.delete('/stores/categories/:id', pm, al('category_delete',   {send: true}), (req, res) => {
        m.stores.categories.findOne({
            where:      {category_id: req.params.id},
            attributes: ['category_id']
        })
        .then(category => {
            if (!category) res.send({success: false, message: 'Category not found'})
            else {
                return m.stores.item_categories.destroy(
                    {where: {category_id: category.category_id}}
                )
                .then(result => {
                    return category.destroy()
                    .then(result => {
                        if (!result) res.send({success: false, message: 'Category not deleted'})
                        else         res.send({success: true,  message: 'Category deleted'})
                    })
                    .catch(err => res.send({success: false, message: `Error deleting category: ${err.message}`}))
                })
                .catch(err => res.send({success: false, message: `Error deleting item categories: ${err.message}`}))
            };
        })
        .catch(err => res.send({success: false, message: `Error getting category: ${err.message}`}));
    });
};