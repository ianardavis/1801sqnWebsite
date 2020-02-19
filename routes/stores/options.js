module.exports = (app, allowed, fn, isLoggedIn, m) => {
    app.post('/stores/options/categories', isLoggedIn, allowed('categories_add'), (req, res) => createOption('categories', 'Category', req, res));
    app.post('/stores/options/groups',     isLoggedIn, allowed('groups_add'),     (req, res) => createOption('groups',     'Group',    req, res));
    app.post('/stores/options/types',      isLoggedIn, allowed('types_add'),      (req, res) => createOption('types',      'Type',     req, res));
    app.post('/stores/options/subtypes',   isLoggedIn, allowed('subtypes_add'),   (req, res) => createOption('subtypes',   'Sub type', req, res));
    function createOption (table, table_s, req, res) {
        fn.create(
            m[table],
            req.body.record
        )
        .then(result => {
            req.flash('success', table_s + ' added');
            res.redirect('/stores/settings');
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    };

    app.put('/stores/options/categories', isLoggedIn, allowed('categories_edit'), (req, res) => editOption('categories', 'Category', req, res));
    app.put('/stores/options/groups',     isLoggedIn, allowed('groups_edit'),     (req, res) => editOption('groups',     'Group',    req, res));
    app.put('/stores/options/types',      isLoggedIn, allowed('types_edit'),      (req, res) => editOption('types',      'Type',     req, res));
    app.put('/stores/options/subtypes',   isLoggedIn, allowed('subtypes_edit'),   (req, res) => editOption('subtypes',   'Sub type', req, res));
    function editOption (table, table_s, req, res) {
        if (req.body.where && req.body.where !== "") {
            try {
                fn.update(
                    m[table],
                    req.body.record,
                    JSON.parse(req.body.where),
                    true
                )
                .then(result => {
                    if (result) req.flash('success', table_s + ' edited');
                    res.redirect('/stores/settings');
                })
                .catch(err => fn.error(err, '/stores/settings', req, res));
            } catch(err) {
                fn.error(err, '/stores/settings', req, res);
            };
        } else fn.error(new Error('No valid where statement for edit'), '/stores/settings', req, res);
    };

    app.delete('/stores/options/categories', isLoggedIn, allowed('categories_delete'), (req, res) => checkDelete('categories', 'Category', req, res));
    app.delete('/stores/options/groups',     isLoggedIn, allowed('groups_delete'),     (req, res) => checkDelete('groups',     'Group',    req, res));
    app.delete('/stores/options/types',      isLoggedIn, allowed('types_delete'),      (req, res) => checkDelete('types',      'Type',     req, res));
    app.delete('/stores/options/subtypes',   isLoggedIn, allowed('subtypes_delete'),   (req, res) => checkDelete('subtypes',   'Sub type', req, res));
    function checkDelete (table, table_s, req, res) {
        let check_table;
            if (table === 'categories')  check_table = m.groups
            else if (table === 'groups') check_table = m.types
            else if (table === 'types')  check_table = m.subtypes;
            if (table !== 'subtypes') {
                fn.getOne(
                    check_table,
                    JSON.parse(req.body.where),
                    {nullOK: true}
                )
                .then(result => {
                    if (result) fn.error(new Error('Can not delete ' + table_s + ' whilst it has sub options'), '/stores/settings', req, res);
                    else deleteOption(table, table_s, req, res);
                })
                .catch(err => fn.error(err, '/stores/settings', req, res))
            } else deleteOption(table, table_s, req, res);
    };
    function deleteOption (table, table_s, req, res) {
        if (req.body.where && req.body.where !== "") {
            try {
                fn.delete(
                    m[table],
                    JSON.parse(req.body.where)
                )
                .then(result => {
                    if (result) req.flash('success', table_s + ' deleted');
                    res.redirect('/stores/settings');
                })
                .catch(err => fn.error(err, '/stores/settings', req, res));
            } catch(err) {
                fn.error(err, '/stores/settings', req, res);
            };
        } else fn.error(new Error('No valid where statement for delete'), '/stores/settings', req, res);
    };
};