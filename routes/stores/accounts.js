const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/accounts/new',      isLoggedIn, allowed('account_add'),                  (req, res) => res.render('stores/accounts/new'));
    app.get('/stores/accounts/:id',      isLoggedIn, allowed('access_accounts'),              (req, res) => {
        db.findOne({
            table:    m.accounts,
            where:   {account_id: req.params.id},
            include: [m.suppliers, inc.users()]
        })
        .then(account => {
            res.render('stores/accounts/show', {
                account:  account,
                show_tab: req.query.tab || 'details'

            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/accounts/:id/edit', isLoggedIn, allowed('account_edit'),                 (req, res) => {
        db.findOne({
            table:    m.accounts,
            where:   {account_id: req.params.id},
            include: [m.suppliers]
        })
        .then(account => res.render('stores/accounts/edit', {account: account}))
        .catch(err => res.error.redirect(err, req, res));
    });

    app.post('/stores/accounts',         isLoggedIn, allowed('account_add',    {send: true}), (req, res) => {
        m.accounts.create(req.body.account)
        .then(account => res.send({result: true, message: 'Account created'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/accounts/:id',      isLoggedIn, allowed('account_edit',   {send: true}), (req, res) => {
        db.update({
            table: m.accounts,
            where: {account_id: req.params.id},
            record: req.body.account
        })
        .then(result => res.send({result: true, message: 'Account saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/accounts/:id',   isLoggedIn, allowed('account_delete', {send: true}), (req, res) => {
        db.destroy({
            table: m.accounts,
            where: {account_id: req.params.id}
        })
        .then(result => {
            db.update({
                table: m.suppliers,
                where: {supplier_id: req.body.supplier_id},
                record: {account_id: null}
            })
            .then(result => res.send({result: true, message: 'Account deleted and supplier updated'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
};