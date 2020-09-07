const op = require('sequelize').Op,
      { scryptSync, randomBytes } = require("crypto");
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/users',              isLoggedIn, allowed('access_users',  {allow: true}),             (req, res) => {
        if (!req.allowed) res.redirect('/stores/users/' + req.user.user_id)
        else res.render('stores/users/index');
    });
    app.get('/stores/users/new',          isLoggedIn, allowed('user_add'),                                 (req, res) => res.render('stores/users/new'));
    app.get('/stores/users/:id',          isLoggedIn, allowed('access_users',  {allow: true}),             (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            res.render('stores/users/show', {
                user_id: req.params.id,
                tab: req.query.tab || 'details'
            });
        } else {
            req.flash('danger', 'Permission denied!')
            res.redirect('/stores/users');
        };
    });
    app.get('/stores/users/:id/password', isLoggedIn, allowed('user_password', {allow: true}),             (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) res.render('stores/users/password', {user_id: req.params.id})
        else res.error.redirect(new Error('Permission denied'), req, res);
    });
    app.get('/stores/users/:id/edit',     isLoggedIn, allowed('user_edit'),                                (req, res) => res.render('stores/users/edit', {user_id: req.params.id}));
    
    app.post('/stores/users',             isLoggedIn, allowed('user_add',      {send: true}),              (req, res) => {
        let salt = randomBytes(16).toString("hex");
        req.body.user._salt = salt;
        req.body.user._password = scryptSync(req.body._password, salt, 32).toString("hex");
        req.body.user._reset = 0;
        m.users.create(req.body.user)
        .then(user => res.send({result: true, message: 'User added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/password/:id',       isLoggedIn, allowed('user_password', {send: true, allow: true}), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            req.body.user._salt = randomBytes(16).toString("hex");
            req.body.user._password = scryptSync(req.body._password, req.body.user._salt, 32).toString("hex");
            db.update({
                table: m.users,
                where: {user_id: req.params.id},
                record: req.body.user
            })
            .then(result => res.send({result: true, message: 'Password changed'}))
            .catch(err => res.error.send(err, res));
        } else res.error.send('Permission denied', res);
    });
    app.put('/stores/users/:id',          isLoggedIn, allowed('user_edit',     {send: true}),              (req, res) => {
        if (!req.body.user)        req.body.user = {};
        if (!req.body.user._reset) req.body.user._reset = 0;
        db.update({
            table: m.users,
            where: {user_id: req.params.id},
            record: req.body.user
        })
        .then(result => res.send({result: true, message: 'User saved'}))
        .catch(err => res.error.send(err.message, res));
    });
};
