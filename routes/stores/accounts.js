const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    app.get('/stores/accounts/new',      isLoggedIn, allowed('account_add'),                (req, res) => res.render('stores/accounts/new'));
    app.get('/stores/accounts/:id',      isLoggedIn, allowed('access_accounts'),            (req, res) => res.render('stores/accounts/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/accounts/:id/edit', isLoggedIn, allowed('account_edit'),               (req, res) => res.render('stores/accounts/edit'));
    app.put('/stores/accounts/:id',      isLoggedIn, allowed('account_edit', {send: true}), (req, res) => {
        m.accounts.update(
            req.body.account,
            {where: {account_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'Account saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/accounts',         isLoggedIn, allowed('account_add',  {send: true}), (req, res) => {
        m.accounts.create(req.body.account)
        .then(account => res.send({result: true, message: 'Account created'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/accounts/:id',     isLoggedIn, allowed('account_delete',     {send: true}), (req, res) => {
        m.accounts.destroy({where: {account_id: req.params.id}})
        .then(result => {
            m.suppliers.update(
                {account_id: null},
                {where: {supplier_id: req.body.supplier_id}}
            )
            .then(result => res.send({result: true, message: 'Account deleted and supplier updated'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
};