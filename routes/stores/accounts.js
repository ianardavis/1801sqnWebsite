module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/accounts',    pm.check('access_accounts', {send: true}), (req, res) => {
        return m.accounts.findAll({
            where:   req.query,
            include: [inc.users({as: 'user_account'})]
        })
        .then(accounts => res.send({success: true, result: accounts}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/account',     pm.check('access_accounts', {send: true}), (req, res) => {
        return m.accounts.findOne({
            where:   req.query,
            include: [
                inc.users({as: 'user'}),
                inc.users({as: 'user_account'})
            ]
        })
        .then(account => {
            if (account) res.send({success: true,  result: account})
            else         res.send({success: false, message: 'Account not found'});
        })
        .catch(err => res.error.send(err, res));
    });

    app.put('/accounts/:id',    pm.check('account_edit',    {send: true}), (req, res) => {
        m.accounts.update(
            req.body.account,
            {where: {account_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Account saved'}))
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/accounts',       pm.check('account_add',     {send: true}), (req, res) => {
        m.accounts.create({
            ...req.body.account,
            ...{user_id: req.user.user_id}
        })
        .then(account => res.send({success: true, message: 'Account created'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/accounts/:id', pm.check('account_delete',  {send: true}), (req, res) => {
        console.log(req.params.id)
        m.accounts.findOne({
            where: {account_id: req.params.id},
            attributes: ['account_id']
        })
        .then(account => {
            if (!account) res.send({success: false, message: 'Account not found'})
            else {
                return account.destroy()
                .then(result => {
                    if (!result) res.send({success: false, message: 'Account not deleted'})
                    else {
                        return m.suppliers.update(
                            {account_id: null},
                            {where: {account_id: account.account_id}}
                        )
                        .then(result => res.send({success: true, message: 'Account deleted'}))
                        .catch(err => res.send({success: false, message: `Error updating suppliers: ${err.message}`}));
                    };
                })
                .catch(err => res.send({success: false, message: `Error deleting account: ${err.message}`}));
            };
        })
        .catch(err => res.send({success: false, message: `Error getting account: ${err.message}`}));
    });
};