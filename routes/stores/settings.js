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
    app.get('/stores/settings',                isLoggedIn, allowed('access_settings'),              (req, res) => {
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

    app.put('/stores/settings',                isLoggedIn, allowed('setting_edit',   {send: true}), (req, res) => {
        console.log(req.body);
        console.log(req.query);
        if (!req.query) res.send({result: false, message: 'No query specified'})
        else {
            m.settings.update(
                req.body.setting,
                {where: req.query}
            )
            .then(result => {
                let message = '';
                if (result) message = 'Setting updated'
                else message = 'Setting not updated';
                res.send({result: true, message: message})
            })
            .catch(err => res.error.redirect(err, req, res));
        };
    });
    
    app.get('/stores/get/options/:table',      isLoggedIn, allowed('access_options', {send: true}), (req, res) => {
        let allowed_tables = ['ranks', 'genders', 'statuses', 'categories', 'groups', 'types', 'subtypes']
        if (allowed_tables.includes(req.params.table)) {
            m[req.params.table].findAll({where: req.query})
            .then(results => res.send({result: true, results: results}))
            .catch(err => res.error.send(err, res));
        } else res.error.send(new Error('Invalid request', res));
    });
    
    app.post('/stores/options/:table',         isLoggedIn, allowed('option_add',     {send: true}), (req, res) => {
        m[req.params.table].create(req.body[req.params.table])
        .then(record => {
            req.flash('success', 'Record added to ' + req.params.table);
            res.redirect('/stores/settings?show=' + req.params.table)
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.put('/stores/options/:table/:id',      isLoggedIn, allowed('option_edit',    {send: true}), (req, res) => {
        let id_field = {};
        id_field[singularise(req.params.table) + '_id'] = req.params.id;
        db.update({
            table: m[req.params.table],
            where: id_field,
            record: req.body[req.params.table]
        })
        .then(result => {
            req.flash('success', 'Record updated in ' + req.params.table);
            res.redirect('/stores/settings?show=' + req.params.table);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.delete('/stores/options/genders/:id',  isLoggedIn, allowed('option_delete',  {send: true}),   (req, res) => _delete('genders', req, res));
    app.delete('/stores/options/ranks/:id',    isLoggedIn, allowed('option_delete',  {send: true}),   (req, res) => deleteSetting('ranks', req, res));
    app.delete('/stores/options/statuses/:id', isLoggedIn, allowed('option_delete',  {send: true}),   (req, res) => deleteSetting('statuses', req, res));
    app.delete('/stores/options/:table/:id',   isLoggedIn, allowed('option_delete',  {send: true}),   (req, res) => {
        let check_table;
        if (req.params.table === 'categories')  check_table = m.groups
        else if (req.params.table === 'groups') check_table = m.types
        else if (req.params.table === 'types')  check_table = m.subtypes;
        if (req.params.table !== 'subtypes') {
            let where = {};
            where[req.singularise(req.params.table) + '_id'] = req.params.id;
            check_table.findOne({where: where})
            .then(result => {
                if (result) res.error.redirect(new Error('Can not delete ' + singularise(req.params.table) + ' whilst it has sub options'), req, res);
                else _delete(req.params.table, req, res);
            })
            .catch(err => res.error.redirect(err, req, res))
        } else _delete(table, req, res);
    });
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