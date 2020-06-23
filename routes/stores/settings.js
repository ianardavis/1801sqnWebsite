module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    function options() {
        return [
            {table: 'categories'},
            {table: 'groups', include: m.categories},
            {table: 'types', include: m.groups},
            {table: 'subtypes', include: m.types},
            {table: 'genders'},
            {table: 'ranks'},
            {table: 'statuses'}
        ]
    };
    //INDEX
    app.get('/stores/settings', isLoggedIn, allowed('access_settings'), (req, res) => {
        fn.getAll(m.settings)
        .then(settings => {
            fn.getOptions(options(), req)
            .then(classes => {
                res.render('stores/settings/show', {
                    settings: settings,
                    classes:  classes,
                    showtab: req.query.show || 'ranks'
                });
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    //POST
    app.post('/stores/settings/ranks',      isLoggedIn, allowed('rank_add'),     (req, res) => createSetting('ranks',      req, res));
    app.post('/stores/settings/genders',    isLoggedIn, allowed('gender_add'),   (req, res) => createSetting('genders',    req, res));
    app.post('/stores/settings/statuses',   isLoggedIn, allowed('status_add'),   (req, res) => createSetting('statuses',   req, res));
    app.post('/stores/settings/categories', isLoggedIn, allowed('category_add'), (req, res) => createSetting('categories', req, res));
    app.post('/stores/settings/groups',     isLoggedIn, allowed('group_add'),    (req, res) => createSetting('groups',     req, res));
    app.post('/stores/settings/types',      isLoggedIn, allowed('type_add'),     (req, res) => createSetting('types',      req, res));
    app.post('/stores/settings/subtypes',   isLoggedIn, allowed('subtype_add'),  (req, res) => createSetting('subtypes',   req, res));
    function createSetting(table, req, res) {
        fn.create(
            m[table],
            req.body[table]
        )
        .then(record => {
            req.flash('success', 'Record added to ' + table);
            res.redirect('/stores/settings?show=' + table)
        })
        .catch(err => res.error.redirect(err, req, res));
    };
    
    //PUT
    app.put('/stores/settings/ranks/:id',      isLoggedIn, allowed('rank_edit'),     (req, res) => updateSetting('ranks',      req, res));
    app.put('/stores/settings/genders/:id',    isLoggedIn, allowed('gender_edit'),   (req, res) => updateSetting('genders',    req, res));
    app.put('/stores/settings/statuses/:id',   isLoggedIn, allowed('status_edit'),   (req, res) => updateSetting('statuses',   req, res));
    app.put('/stores/settings/categories/:id', isLoggedIn, allowed('category_edit'), (req, res) => updateSetting('categories', req, res));
    app.put('/stores/settings/groups/:id',     isLoggedIn, allowed('group_edit'),    (req, res) => updateSetting('groups',     req, res));
    app.put('/stores/settings/types/:id',      isLoggedIn, allowed('type_edit'),     (req, res) => updateSetting('types',      req, res));
    app.put('/stores/settings/subtypes/:id',   isLoggedIn, allowed('subtype_edit'),  (req, res) => updateSetting('subtypes',   req, res));
    function updateSetting(table, req, res) {
        let id_field = {};
        id_field[fn.singularise(table) + '_id'] = req.params.id;
        fn.update(
            m[table],
            req.body[table],
            id_field
        )
        .then(result => {
            req.flash('success', 'Record updated in ' + table);
            res.redirect('/stores/settings?show=' + table);
        })
        .catch(err => res.error.redirect(err, req, res));
    };
    
    //DELETE
    app.delete('/stores/settings/genders/:id',    isLoggedIn, allowed('gender_delete'),   (req, res) => _delete('genders', req, res));
    app.delete('/stores/settings/ranks/:id',      isLoggedIn, allowed('rank_delete'),     (req, res) => deleteSetting('ranks', req, res));
    app.delete('/stores/settings/statuses/:id',   isLoggedIn, allowed('status_delete'),   (req, res) => deleteSetting('statuses', req, res));
    app.delete('/stores/settings/categories/:id', isLoggedIn, allowed('category_delete'), (req, res) => checkDelete('categories', req, res));
    app.delete('/stores/settings/groups/:id',     isLoggedIn, allowed('group_delete'),    (req, res) => checkDelete('groups',     req, res));
    app.delete('/stores/settings/types/:id',      isLoggedIn, allowed('type_delete'),     (req, res) => checkDelete('types',      req, res));
    app.delete('/stores/settings/subtypes/:id',   isLoggedIn, allowed('subtype_delete'),  (req, res) => checkDelete('subtypes',   req, res));
    function checkDelete (table, req, res) {
        let check_table;
        if (table === 'categories')  check_table = m.groups
        else if (table === 'groups') check_table = m.types
        else if (table === 'types')  check_table = m.subtypes;
        if (table !== 'subtypes') {
            let where = {};
            where[fn.singularise(table) + '_id'] = req.params.id;
            fn.getOne(
                check_table,
                where,
                {nullOK: true}
            )
            .then(result => {
                if (result) res.error.redirect(new Error('Can not delete ' + fn.singularise(table) + ' whilst it has sub options'), '/stores/settings?show=item-classes', req, res);
                else _delete(table, req, res);
            })
            .catch(err => res.error.redirect(err, req, res))
        } else _delete(table, req, res);
    };
    function deleteSetting(table, req, res) {
        if (table === 'statuses' && req.params.id <= 5) {
            req.flash('danger', 'This status can not be deleted');
            res.redirect('/stores/settings?show=statuses');
        } else {
            let id_field = {};
            id_field[fn.singularise(table) + '_id'] = req.params.id;
            fn.getOne(
                m.users,
                id_field,
                {nullOK: true}
            )
            .then(record => {
                if (!record) _delete(table, req, res)
                else {
                    req.flash('danger', 'Cannot delete a ' + fn.singularise(table) + ' whilst it is assigned to any users!');
                    res.redirect('/stores/settings?show=' + table);
                };
            })
            .catch(err => res.error.redirect(err, req, res));
        };
    };
    function _delete (table, req, res) {
        let where = {};
        where[fn.singularise(table) + '_id'] = req.params.id;
        fn.delete(
            m[table],
            where
        )
        .then(result => {
            if (result) req.flash('success', 'Record deleted from ' + table);
            res.redirect('/stores/settings?show=' + table);
        })
        .catch(err => res.error.redirect(err, req, res));
    };

};