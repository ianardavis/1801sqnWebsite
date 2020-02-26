const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    app.get('/stores/accounts/new', isLoggedIn, allowed('account_add'), (req, res) => {
        if (req.query.supplier_id) {
            fn.getAllWhere(
                m.users,
                {
                    user_id: {[op.not]: 1},
                    status_id: 2
                },
                {include: [m.ranks]}
            )
            .then(users => {
                fn.getOne(
                    m.suppliers,
                    {supplier_id: req.query.supplier_id}
                )
                .then(supplier => {
                    res.render('stores/accounts/new', {
                        supplier: supplier,
                        users:    users
                    });
                })
                .catch(err => fn.error(err, '/stores/suppliers', req, res));
            })
            .catch(err => fn.error(err, '/stores/suppliers', req, res));
        } else {
            req.flash('danger', 'No supplier specified');
            res.redirect('/stores/suppliers')
        };
    });
    app.post('/stores/accounts', isLoggedIn, allowed('account_add'), (req, res) => {
        fn.create(
            m.accounts,
            req.body.account
        )
        .then(account => {
            req.flash('success', 'Account created');
            res.redirect('/stores/suppliers/' + req.body.supplier_id + '/edit')
        })
        .catch(err => fn.error(err, '/stores/suppliers/' + req.body.supplier_id + '/edit', req, res));
    });

    app.get('/stores/accounts/:id/edit', isLoggedIn, allowed('account_edit'), (req, res) => {
        fn.getOne(
            m.accounts,
            {account_id: req.params.id},
            {include: [m.suppliers]}
        )
        .then(account => {
            fn.getAllWhere(
                m.users,
                {
                    user_id: {[op.not]: 1},
                    status_id: 2
                },
                {include: [m.ranks]}
            )
            .then(users => {
                fn.getNotes('accounts', req.params.id, req)
                .then(notes => {
                    res.render('stores/accounts/edit', {
                        users:   users,
                        account: account,
                        notes:   notes,
                        query:   {system: req.query.system || 2}
                    });
                })
                .catch(err => fn.error(err, '/stores/suppliers', req, res));
            })
            .catch(err => fn.error(err, '/stores/suppliers', req, res));
        })
        .catch(err => fn.error(err, '/stores.suppliers', req, res));
    });
    app.put('/stores/accounts/:id', isLoggedIn, allowed('account_edit'), (req, res) => {
        fn.update(
            m.accounts,
            req.body.account,
            {account_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Account updated');
            res.redirect('/stores/suppliers/' + req.body.supplier_id);
        })
        .catch(err => fn.error(err, '/stores/suppliers/' + req.body.supplier_id, req, res));
    });

    app.delete('/stores/accounts/:id', isLoggedIn, allowed('account_delete'), (req, res) => {
        fn.delete(
            'accounts',
            {account_id: req.params.id}
        )
        .then(result => {
            fn.update(
                m.suppliers,
                {account_id: null},
                {supplier_id: req.body.supplier_id}
            )
            .then(result => {
                req.flash('success', 'Account deleted and supplier updated');
                res.redirect('/stores/suppliers/' + req.body.supplier_id);
            })
            .catch(err => fn.error(err, '/stores/suppliers/' + req.body.supplier_id, req, res));
        })
        .catch(err => fn.error(err, '/stores/suppliers/' + req.body.supplier_id, req, res));
    });
};