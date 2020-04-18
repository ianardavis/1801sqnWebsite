const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //NEW
    app.get('/stores/accounts/new', isLoggedIn, allowed('account_add'), (req, res) => {
        fn.getAllWhere(
            m.users,
            {
                user_id: {[op.not]: 1},
                status_id: 2
            },
            {include: [m.ranks]}
        )
        .then(users => res.render('stores/accounts/new', {users: users}))
        .catch(err => fn.error(err, '/', req, res));
    });
    //SHOW
    app.get('/stores/accounts/:id', isLoggedIn, allowed('access_accounts'), (req, res) => {
        fn.getOne(
            m.accounts,
            {account_id: req.params.id},
            {include: [m.suppliers, inc.users()]}
        )
        .then(account => {
            res.render('stores/accounts/show', {
                account:  account,
                notes:    {table: 'accounts', id: account.account_id},
                query:    req.query,
                show_tab: req.query.tab || 'details'

            });
        })
        .catch(err => fn.error(err, '/', req, res));
    });
    //EDIT
    app.get('/stores/accounts/:id/edit', isLoggedIn, allowed('account_edit'), (req, res) => {
        fn.getOne(
            m.accounts,
            {account_id: req.params.id},
            {include: [m.suppliers, inc.users()]}
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
                res.render('stores/accounts/edit', {
                    users:   users,
                    account: account
                });
            })
            .catch(err => fn.error(err, '/', req, res));
        })
        .catch(err => fn.error(err, '/', req, res));
    });

    //POST
    app.post('/stores/accounts', isLoggedIn, allowed('account_add', {send: true}), (req, res) => {
        fn.create(
            m.accounts,
            req.body.account
        )
        .then(account => res.send({result: true, message: 'Account created'}))
        .catch(err => fn.send_error(err.message, res));
    });

    //PUT
    app.put('/stores/accounts/:id', isLoggedIn, allowed('account_edit', {send: true}), (req, res) => {
        fn.update(
            m.accounts,
            req.body.account,
            {account_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'Account saved'}))
        .catch(err => fn.send_error(err.message, res));
    });

    //DELETE
    app.delete('/stores/accounts/:id', isLoggedIn, allowed('account_delete', {send: true}), (req, res) => {
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
            .then(result => res.send({result: true, message: 'Account deleted and supplier updated'}))
            .catch(err => fn.send_error(err.message, res));
        })
        .catch(err => fn.send_error(err.message, res));
    });
};