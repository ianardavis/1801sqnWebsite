module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/accounts',    li, pm.check('access_accounts', {send: true}), (req, res) => {
        return m.accounts.findAll({
            where:   req.query,
            include: [inc.user()]
        })
        .then(accounts => res.send({success: true, result: accounts}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/account',     li, pm.check('access_accounts', {send: true}), (req, res) => {
        return m.accounts.findOne({
            where:   req.query,
            include: [
                inc.user()
            ]
        })
        .then(account => {
            if (account) res.send({success: true,  result: account})
            else         send_error(res, 'Account not found');
        })
        .catch(err => send_error(res, err));
    });

    app.put('/accounts/:id',    li, pm.check('account_edit',    {send: true}), (req, res) => {
        m.accounts.update(
            req.body.account,
            {where: {account_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Account saved'}))
        .catch(err => send_error(res, err));
    });
    
    app.post('/accounts',       li, pm.check('account_add',     {send: true}), (req, res) => {
        m.accounts.create({
            ...req.body.account,
            ...{user_id: req.user.user_id}
        })
        .then(account => res.send({success: true, message: 'Account created'}))
        .catch(err => send_error(res, err));
    });

    app.delete('/accounts/:id', li, pm.check('account_delete',  {send: true}), (req, res) => {
        m.accounts.findOne({
            where: {account_id: req.params.id},
            attributes: ['account_id']
        })
        .then(account => {
            if (!account) send_error(res, 'Account not found')
            else {
                return account.destroy()
                .then(result => {
                    if (!result) send_error(res, 'Account not deleted')
                    else {
                        return m.suppliers.update(
                            {account_id: null},
                            {where: {account_id: account.account_id}}
                        )
                        .then(result => res.send({success: true, message: 'Account deleted'}))
                        .catch(err => send_error(res, `Error updating suppliers: ${err.message}`));
                    };
                })
                .catch(err => send_error(res, `Error deleting account: ${err.message}`));
            };
        })
        .catch(err => send_error(res, `Error getting account: ${err.message}`));
    });
};