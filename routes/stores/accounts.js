module.exports = (app, m, fn) => {
    app.get('/get/account',     fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        m.accounts.findOne({
            where: req.query.where,
            include: [fn.inc.users.user()]
        })
        .then(account => {
            if (account) {
                res.send({success: true, result: account});
            } else {
                res.send({success: false, message: 'Account not found'});
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/accounts',    fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        m.accounts.findAndCountAll({
            where:   req.query.where,
            include: [fn.inc.users.user()],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('accounts', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/accounts/:id',    fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.accounts.edit(req.params.id, req.body.account)
        .then(result => res.send({success: result, message: `Account ${(result ? '' : 'not ')}saved`}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/accounts',       fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        m.accounts.create({
            ...req.body.account,
            ...{user_id: req.user.user_id}
        })
        .then(account => res.send({success: true, message: 'Account created'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/accounts/:id', fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.accounts.get(req.params.id)
        .then(account => {
            account.destroy()
            .then(result => {
                if (!result) {
                    fn.send_error(res, 'Account not deleted');
                } else {
                    m.suppliers.update(
                        {account_id: null},
                        {where: {account_id: account.account_id}}
                    )
                    .then(result => res.send({success: true, message: 'Account deleted'}))
                    .catch(err => fn.send_error(res, `Error updating suppliers: ${err.message}`));
                };
            })
            .catch(err => fn.send_error(res, `Error deleting account: ${err.message}`));
        })
        .catch(err => fn.send_error(res, `Error getting account: ${err.message}`));
    });
};