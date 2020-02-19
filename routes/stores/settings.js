module.exports = (app, allowed, fn, isLoggedIn, m) => {
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
        .catch(err => fn.error(err, '/stores', req, res));
    });

    // New Logic
    app.post('/stores/settings/ranks',    isLoggedIn, allowed('ranks_add'),    (req, res) => createSetting('ranks', req, res));
    app.post('/stores/settings/genders',  isLoggedIn, allowed('genders_add'),  (req, res) => createSetting('genders', req, res));
    app.post('/stores/settings/statuses', isLoggedIn, allowed('statuses_add'), (req, res) => createSetting('statuses', req, res));
    function createSetting(table, req, res) {
        fn.create(
            m[table],
            req.body[table]
        )
        .then(record => {
            req.flash('success', 'Record added to ' + table);
            res.redirect('/stores/settings?show=' + table)
        })
        .catch(err => fn.error(err, '/stores/settings?show=' + table, req, res));
    };
    
    // Put
    app.put('/stores/settings/ranks/:id',    isLoggedIn, allowed('ranks_edit'),    (req, res) => updateSetting('ranks', req, res));
    app.put('/stores/settings/genders/:id',  isLoggedIn, allowed('genders_edit'),  (req, res) => updateSetting('genders', req, res));
    app.put('/stores/settings/statuses/:id', isLoggedIn, allowed('statuses_edit'), (req, res) => updateSetting('statuses', req, res));
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
        .catch(err => fn.error(err, '/stores/settings?show=' + table, req, res));
    };
    
    // Delete
    app.delete('/stores/settings/genders/:id', isLoggedIn, allowed('genders_delete'), (req, res) => {
        fn.delete(
            'genders',
            {gender_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Gender deleted');
            res.redirect('/stores/settings?show=genders');
        })
        .catch(err => fn.error(err, '/stores/settings?show=genders', req, res));
    });
    app.delete('/stores/settings/ranks/:id',    isLoggedIn, allowed('ranks_delete'),    (req, res) => deleteSetting('ranks', req, res));
    app.delete('/stores/settings/statuses/:id', isLoggedIn, allowed('statuses_delete'), (req, res) => deleteSetting('statuses', req, res));
    function deleteSetting(table, req, res) {
        let id_field = {};
        id_field[fn.singularise(table) + '_id'] = req.params.id;
        fn.getOne(
            m.users,
            id_field,
            {nullOK: true}
        )
        .then(record => {
            if (!record) {
                fn.delete(
                    table,
                    id_field
                )
                .then(result => {
                    if (result) req.flash('success', 'Record deleted from ' + table);
                    res.redirect('/stores/settings?show=' + table);
                })
                .catch(err => fn.error(err, '/stores/settings?show=' + table, req, res));
            } else {
                req.flash('danger', 'Cannot delete a ' + fn.singularise(table) + ' whilst it is assigned to any users!');
                res.redirect('/stores/settings?show=' + table);
            }
        })
        .catch(err => fn.error(err, '/stores/settings?show=' + table, req, res));
    };
};