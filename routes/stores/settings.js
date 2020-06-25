module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db          = require(process.env.ROOT + '/fn/db'),
        options     = require(process.env.ROOT + '/fn/options'),
        singularise = require(process.env.ROOT + '/fn/utils').singularise;
    _options = () => {
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
    app.get('/stores/settings', isLoggedIn, allowed('access_settings'), (req, res) => {
        m.settings.findAll()
        .then(settings => {
            options.get(_options())
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

    app.post('/stores/settings/ranks',      isLoggedIn, allowed('rank_add'),     (req, res) => createSetting('ranks',      req, res));
    app.post('/stores/settings/genders',    isLoggedIn, allowed('gender_add'),   (req, res) => createSetting('genders',    req, res));
    app.post('/stores/settings/statuses',   isLoggedIn, allowed('status_add'),   (req, res) => createSetting('statuses',   req, res));
    app.post('/stores/settings/categories', isLoggedIn, allowed('category_add'), (req, res) => createSetting('categories', req, res));
    app.post('/stores/settings/groups',     isLoggedIn, allowed('group_add'),    (req, res) => createSetting('groups',     req, res));
    app.post('/stores/settings/types',      isLoggedIn, allowed('type_add'),     (req, res) => createSetting('types',      req, res));
    app.post('/stores/settings/subtypes',   isLoggedIn, allowed('subtype_add'),  (req, res) => createSetting('subtypes',   req, res));
    createSetting = (table, req, res) => {
        m[table].create(req.body[table])
        .then(record => {
            req.flash('success', 'Record added to ' + table);
            res.redirect('/stores/settings?show=' + table)
        })
        .catch(err => res.error.redirect(err, req, res));
    };
    
    app.put('/stores/settings/ranks/:id',      isLoggedIn, allowed('rank_edit'),     (req, res) => updateSetting('ranks',      req, res));
    app.put('/stores/settings/genders/:id',    isLoggedIn, allowed('gender_edit'),   (req, res) => updateSetting('genders',    req, res));
    app.put('/stores/settings/statuses/:id',   isLoggedIn, allowed('status_edit'),   (req, res) => updateSetting('statuses',   req, res));
    app.put('/stores/settings/categories/:id', isLoggedIn, allowed('category_edit'), (req, res) => updateSetting('categories', req, res));
    app.put('/stores/settings/groups/:id',     isLoggedIn, allowed('group_edit'),    (req, res) => updateSetting('groups',     req, res));
    app.put('/stores/settings/types/:id',      isLoggedIn, allowed('type_edit'),     (req, res) => updateSetting('types',      req, res));
    app.put('/stores/settings/subtypes/:id',   isLoggedIn, allowed('subtype_edit'),  (req, res) => updateSetting('subtypes',   req, res));
    updateSetting = (table, req, res) => {
        let id_field = {};
        id_field[singularise(table) + '_id'] = req.params.id;
        db.update({
            table: m[table],
            where: id_field,
            record: req.body[table]
        })
        .then(result => {
            req.flash('success', 'Record updated in ' + table);
            res.redirect('/stores/settings?show=' + table);
        })
        .catch(err => res.error.redirect(err, req, res));
    };
    
    app.delete('/stores/settings/genders/:id',    isLoggedIn, allowed('gender_delete'),   (req, res) => _delete('genders', req, res));
    app.delete('/stores/settings/ranks/:id',      isLoggedIn, allowed('rank_delete'),     (req, res) => deleteSetting('ranks', req, res));
    app.delete('/stores/settings/statuses/:id',   isLoggedIn, allowed('status_delete'),   (req, res) => deleteSetting('statuses', req, res));
    app.delete('/stores/settings/categories/:id', isLoggedIn, allowed('category_delete'), (req, res) => checkDelete('categories', req, res));
    app.delete('/stores/settings/groups/:id',     isLoggedIn, allowed('group_delete'),    (req, res) => checkDelete('groups',     req, res));
    app.delete('/stores/settings/types/:id',      isLoggedIn, allowed('type_delete'),     (req, res) => checkDelete('types',      req, res));
    app.delete('/stores/settings/subtypes/:id',   isLoggedIn, allowed('subtype_delete'),  (req, res) => checkDelete('subtypes',   req, res));
    checkDelete = (table, req, res) => {
        let check_table;
        if (table === 'categories')  check_table = m.groups
        else if (table === 'groups') check_table = m.types
        else if (table === 'types')  check_table = m.subtypes;
        if (table !== 'subtypes') {
            let where = {};
            where[req.singularise(table) + '_id'] = req.params.id;
            check_table.findOne({where: where})
            .then(result => {
                if (result) res.error.redirect(new Error('Can not delete ' + singularise(table) + ' whilst it has sub options'), req, res);
                else _delete(table, req, res);
            })
            .catch(err => res.error.redirect(err, req, res))
        } else _delete(table, req, res);
    };
    deleteSetting = (table, req, res) => {
        if (table === 'statuses' && req.params.id <= 5) {
            req.flash('danger', 'This status can not be deleted');
            res.redirect('/stores/settings?show=statuses');
        } else {
            let id_field = {};
            id_field[singularise(table) + '_id'] = req.params.id;
            m.users.findOne({where: id_field})
            .then(record => {
                if (!record) _delete(table, req, res)
                else {
                    req.flash('danger', 'Cannot delete a ' + singularise(table) + ' whilst it is assigned to any users!');
                    res.redirect('/stores/settings?show=' + table);
                };
            })
            .catch(err => res.error.redirect(err, req, res));
        };
    };
    _delete = (table, req, res) => {
        let where = {};
        where[singularise(table) + '_id'] = req.params.id;
        db.destroy({
            table: m[table],
            where: where
        })
        .then(result => {
            if (result) req.flash('success', 'Record deleted from ' + table);
            res.redirect('/stores/settings?show=' + table);
        })
        .catch(err => res.error.redirect(err, req, res));
    };

};