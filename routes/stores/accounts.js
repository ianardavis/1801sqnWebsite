module.exports = (app, fn) => {
    app.get('/get/account',     fn.loggedIn, fn.permissions.check('access_stores'),  (req, res) => {
        fn.accounts.find(req.query.where)
        .then(account => res.send({success: true, result: account}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/accounts',    fn.loggedIn, fn.permissions.check('access_stores'),  (req, res) => {
        fn.accounts.findAll(req.query)
        .then(accounts => fn.sendRes('accounts', res, accounts, req.query))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/accounts/:id',    fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        fn.accounts.edit(req.params.id, req.body.account)
        .then(result => res.send({success: result, message: `Account ${(result ? '' : 'not ')}saved`}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.post('/accounts',       fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        fn.accounts.create(req.body.account)
        .then(account => res.send({success: true, message: 'Account created'}))
        .catch(err => fn.sendError(res, err));
    });

    app.delete('/accounts/:id', fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        fn.accounts.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Account deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};