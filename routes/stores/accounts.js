module.exports = (app, m, inc, fn) => {
    app.get('/get/accounts',    fn.li(), fn.permissions.check('access_accounts', {send: true}), (req, res) => {
        return m.accounts.findAll({
            where:   req.query,
            include: [inc.user()]
        })
        .then(accounts => res.send({success: true, result: accounts}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/account',     fn.li(), fn.permissions.check('access_accounts', {send: true}), (req, res) => {
        return m.accounts.findOne({
            where:   req.query,
            include: [
                inc.user()
            ]
        })
        .then(account => {
            if (account) res.send({success: true,  result: account})
            else         fn.send_error(res, 'Account not found');
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/accounts/:id',    fn.li(), fn.permissions.check('account_edit',    {send: true}), (req, res) => {
        m.accounts.update(
            req.body.account,
            {where: {account_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Account saved'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/accounts',       fn.li(), fn.permissions.check('account_add',     {send: true}), (req, res) => {
        m.accounts.create({
            ...req.body.account,
            ...{user_id: req.user.user_id}
        })
        .then(account => res.send({success: true, message: 'Account created'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/accounts/:id', fn.li(), fn.permissions.check('account_delete',  {send: true}), (req, res) => {
        m.accounts.findOne({
            where: {account_id: req.params.id},
            attributes: ['account_id']
        })
        .then(account => {
            if (!account) fn.send_error(res, 'Account not found')
            else {
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
            };
        })
        .catch(err => fn.send_error(res, `Error getting account: ${err.message}`));
    });
};