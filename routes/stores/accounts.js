const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/get/accounts',    pm, al('access_accounts', {send: true}), (req, res) => {
        return m.stores.accounts.findAll({
            where:   req.query,
            include: [inc.users({as: 'user_account'})]
        })
        .then(accounts => res.send({success: true, result: accounts}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/account',     pm, al('access_accounts', {send: true}), (req, res) => {
        return m.stores.accounts.findOne({
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

    app.put('/stores/accounts/:id',    pm, al('account_edit',    {send: true}), (req, res) => {
        m.stores.accounts.update(
            req.body.account,
            {where: {account_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Account saved'}))
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/stores/accounts',       pm, al('account_add',     {send: true}), (req, res) => {
        m.stores.accounts.create({
            ...req.body.account,
            ...{user_id: req.user.user_id}
        })
        .then(account => res.send({success: true, message: 'Account created'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/accounts/:id', pm, al('account_delete',  {send: true}), (req, res) => {
        console.log(req.params.id)
        m.stores.accounts.findOne({
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
                        return m.stores.suppliers.update(
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