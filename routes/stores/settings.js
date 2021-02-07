module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/settings',          pm, al('access_settings'),                 (req, res) => res.render('stores/settings/show'));

    app.get('/stores/get/settings',      pm, al('access_settings',   {send: true}), (req, res) => {
        m.stores.settings.findAll({
            where:      req.query,
            attributes: ['setting_id','_name', '_value']
        })
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting settings: ${err.message}`});
        });
    });
    app.get('/stores/get/setting',       pm, al('access_settings',   {send: true}), (req, res) => {
        m.stores.settings.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(setting => {
            if (!setting) res.send({success: false, message: 'Setting not found'})
            else          res.send({success: true,  result: setting})
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting setting: ${err.message}`});
        });
    });
    app.get('/stores/get/genders',       pm, al('access_genders',    {send: true}), (req, res) => {
        m.stores.genders.findAll({where: req.query})
        .then(genders => res.send({success: true, result: genders}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting genders: ${err.message}`});
        });
    });
    app.get('/stores/get/gender',        pm, al('access_genders',    {send: true}), (req, res) => {
        m.stores.genders.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(gender => {
            if (!gender) res.send({success: false, message: 'Gender not found'})
            else         res.send({success: true, result: gender});
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting gender: ${err.message}`});
        });
    });
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

    app.put('/stores/settings',          pm, al('setting_edit',      {send: true}), (req, res) => {
        m.stores.settings.update(
            {_value: req.body.setting._value},
            {where: {_name: req.body.setting._name}}
        )
        .then(result => {
            if (!result) res.send({success: true, message: 'Setting not updated'})
            else         res.send({success: true, message: 'Setting updated'});
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error updating setting: ${err.message}`});
        });
    });
    app.put('/stores/genders',           pm, al('gender_edit',       {send: true}), (req, res) => {
        m.stores.genders.update(
            {_gender: req.body.gender._gender},
            {where: {gender_id: req.body.gender.gender_id}}
        )
        .then(result => {
            if (!result) res.send({success: true, message: 'Gender not updated'})
            else         res.send({success: true, message: 'Gender updated'});
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error updating gender: ${err.message}`});
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

    app.post('/stores/settings',         pm, al('setting_add',       {send: true}), (req, res) => {
        m.stores.settings.create({...req.body.setting, ...{user_id: req.user.user_id}})
        .then(setting => res.send({success: true, message: 'Setting created'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error creating setting: ${err.message}`});
        });
    });
    app.post('/stores/genders',          pm, al('gender_add',        {send: true}), (req, res) => {
        m.stores.genders.create({...req.body.gender, ...{user_id: req.user.user_id}})
        .then(gender => res.send({success: true, message: 'Gender created'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error creating gender: ${err.message}`});
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

    app.delete('/stores/genders/:id',    pm, al('gender_delete',     {send: true}), (req, res) => {
        m.stores.genders.findOne({
            where: {gender_id: req.params.id},
            attributes: ['gender_id']
        })
        .then(gender => {
            if (!gender) res.send({success: false, message: 'Gender not found'})
            else {
                return m.stores.items.update(
                    {gender_id: null},
                    {where: {gender_id: gender.gender_id}}
                )
                .then(result => {
                    return gender.destroy()
                    .then(result => {
                        if (!result) res.send({success: false, message: 'Gender not deleted'})
                        else         res.send({success: true,  message: 'Gender deleted'})
                    })
                    .catch(err => res.send({success: false, message: `Error deleting gender: ${err.message}`}))
                })
                .catch(err => res.send({success: false, message: `Error updating items: ${err.message}`}))
            };
        })
        .catch(err => res.send({success: false, message: `Error getting gender: ${err.message}`}));
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
    app.delete('/stores/settings/:id',   pm, al('setting_delete',    {send: true}), (req, res) => {
        m.stores.settings.findOne({
            where:      {setting_id: req.params.id},
            attributes: ['setting_id']
        })
        .then(setting => {
            if (!setting) res.send({success: false, message: 'Setting not found'})
            else {
                return setting.destroy()
                .then(result => {
                    if (!result) res.send({success: false, message: 'Setting not deleted'})
                    else         res.send({success: true,  message: 'Setting deleted'})
                })
                .catch(err => res.send({success: false, message: `Error deleting setting: ${err.message}`}))
            };
        })
        .catch(err => res.send({success: false, message: `Error getting setting: ${err.message}`}));
    });
};