const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/accounts/new',      isLoggedIn, allowed('account_add'),                (req, res) => res.render('stores/accounts/new'));
    app.get('/stores/accounts/:id',      isLoggedIn, allowed('access_accounts'),            (req, res) => res.render('stores/accounts/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/accounts/:id/edit', isLoggedIn, allowed('account_edit'),               (req, res) => res.render('stores/accounts/edit'));
    app.put('/stores/accounts/:id',      isLoggedIn, allowed('account_edit', {send: true}), (req, res) => {
        db.update({
            table: m.accounts,
            where: {account_id: req.params.id},
            record: req.body.account
        })
        .then(result => res.send({result: true, message: 'Account saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/accounts',         isLoggedIn, allowed('account_add',  {send: true}), (req, res) => {
        m.accounts.create(req.body.account)
        .then(account => res.send({result: true, message: 'Account created'}))
        .catch(err => res.error.send(err, res));
    });
};