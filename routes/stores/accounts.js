const op = require('sequelize').Op;
module.exports = (app, allowed, inc, loggedIn, m) => {
    app.get('/stores/accounts/new',      loggedIn, allowed('account_add'),                   (req, res) => res.render('stores/accounts/new'));
    app.get('/stores/accounts/:id',      loggedIn, allowed('access_accounts'),               (req, res) => res.render('stores/accounts/show'));
    app.get('/stores/accounts/:id/edit', loggedIn, allowed('account_edit'),                  (req, res) => res.render('stores/accounts/edit'));
    
    app.get('/stores/get/accounts',      loggedIn, allowed('access_accounts', {send: true}), (req, res) => {
        return m.stores.accounts.findAll({
            where:   req.query,
            include: [inc.users()]
        })
        .then(accounts => res.send({success: true, result: accounts}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/account',       loggedIn, allowed('access_accounts', {send: true}), (req, res) => {
        return m.stores.accounts.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(account => {
            if (account) res.send({success: true,  result: account})
            else         res.send({success: false, message: 'Account not found'});
        })
        .catch(err => res.error.send(err, res));
    });

    app.put('/stores/accounts/:id',      loggedIn, allowed('account_edit',    {send: true}), (req, res) => {
        m.stores.accounts.update(
            req.body.account,
            {where: {account_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Account saved'}))
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/stores/accounts',         loggedIn, allowed('account_add',     {send: true}), (req, res) => {
        m.stores.accounts.create(req.body.account)
        .then(account => res.send({success: true, message: 'Account created'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/accounts/:id',   loggedIn, allowed('account_delete',  {send: true}), (req, res) => {
        m.stores.accounts.destroy({where: {account_id: req.params.id}})
        .then(result => {
            m.stores.suppliers.update(
                {account_id: null},
                {where: {supplier_id: req.body.supplier_id}}
            )
            .then(result => res.send({success: true, message: 'Account deleted and supplier updated'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
};