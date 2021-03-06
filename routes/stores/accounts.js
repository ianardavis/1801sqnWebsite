module.exports = (app, m, fn) => {
    app.get('/get/accounts',    fn.loggedIn(), fn.permissions.check('access_accounts'), (req, res) => {
        return m.accounts.findAll({
            where:   req.query,
            include: [fn.inc.users.user()]
        })
        .then(accounts => res.send({success: true, result: accounts}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/account',     fn.loggedIn(), fn.permissions.check('access_accounts'), (req, res) => {
        fn.get(
            'accounts',
            req.query,
            [fn.inc.users.user()]
        )
        .then(account => res.send({success: true,  result: account}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/accounts/:id',    fn.loggedIn(), fn.permissions.check('account_edit'),    (req, res) => {
        m.accounts.update(
            req.body.account,
            {where: {account_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Account saved'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/accounts',       fn.loggedIn(), fn.permissions.check('account_add'),     (req, res) => {
        m.accounts.create({
            ...req.body.account,
            ...{user_id: req.user.user_id}
        })
        .then(account => res.send({success: true, message: 'Account created'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/accounts/:id', fn.loggedIn(), fn.permissions.check('account_delete'),  (req, res) => {
        fn.get(
            'accounts',
            {account_id: req.params.id}
        )
        .then(account => {
            return account.destroy()
            .then(result => {
                if (!result) fn.send_error(res, 'Account not deleted')
                else {
                    return m.suppliers.update(
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