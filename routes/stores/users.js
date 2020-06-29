const op     = require('sequelize').Op,
      bCrypt = require('bcrypt');
_options = () => {
    return [
        {table: 'ranks'},
        {table: 'statuses'}
    ]
};
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db      = require(process.env.ROOT + '/fn/db'),
        options = require(process.env.ROOT + '/fn/options');
    app.get('/stores/users',              isLoggedIn, allowed('access_users',  {allow: true}),             (req, res) => {
        if (!req.allowed) res.redirect('/stores/users/' + req.user.user_id);
        else {
            m.statuses.findAll()
            .then(statuses => res.render('stores/users/index', {statuses: statuses}));
        };
    });
    app.get('/stores/users/new',          isLoggedIn, allowed('user_add'),                                 (req, res) => {
        options.get(_options())
        .then(classes => res.render('stores/users/new', {classes: classes}))
    });
    app.get('/stores/users/:id',          isLoggedIn, allowed('access_users',  {allow: true}),             (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            db.findOne({
                table: m.users,
                where: {user_id: req.params.id},
                include: [m.ranks, m.statuses]
            })
            .then(user => {
                res.render('stores/users/show', {
                    f_user:   user,
                    notes:    {table: 'users', id: user.user_id},
                    show_tab: req.query.tab || 'details'
                });
            })
            .catch(err => res.error.redirect(err, req, res));
        } else {
            req.flash('danger', 'Permission denied!')
            res.redirect('/stores/users');
        };
    });
    app.get('/stores/users/:id/password', isLoggedIn, allowed('user_password', {allow: true}),             (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            db.findOne({
                table: m.users,
                where: {user_id: req.params.id},
                include: [m.ranks]
            })
            .then(user => res.render('stores/users/password', {user: user}))
            .catch(err => res.error.redirect(err, req, res));
        } else res.error.redirect(new Error('Permission denied'), '/', req, res);
    });
    app.get('/stores/users/:id/edit',     isLoggedIn, allowed('user_edit'),                                (req, res) => {
        options.get(_options())
        .then(classes => {
            db.findOne({
                table: m.users,
                where: {user_id: req.params.id},
                include: [m.ranks]
            })
            .then(user => {
                res.render('stores/users/edit', {
                    user:    user,
                    classes: classes
                });
            })
            .catch(err => res.error.redirect(err, req, res));
        });
    });
    
    app.get('/stores/get/users',          isLoggedIn, allowed('access_users',  {send: true}),              (req, res) => {
        m.users.findAll({
            where: req.query,
            include: [m.ranks],
            attributes: ['user_id', 'full_name']
        })
        .then(users => res.send({result: true, users: users}))
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/stores/users',             isLoggedIn, allowed('user_add',      {send: true}),              (req, res) => {
        let salt = bCrypt.genSaltSync(10);
        req.body.user._salt = salt;
        req.body.user._password = bCrypt.hashSync(req.body._password, salt);
        req.body.user._reset = 0
        m.users.create(req.body.user)
        .then(user => res.send({result: true, message: 'User added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/password/:id',       isLoggedIn, allowed('user_password', {send: true, allow: true}), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            req.body.user._salt = bCrypt.genSaltSync(10)
            req.body.user._password = bCrypt.hashSync(req.body._password, req.body.user._salt);
            db.update({
                table: m.users,
                where: {user_id: req.params.id},
                record: req.body.user
            })
            .then(result => res.send({result: true, message: 'Password changed'}))
            .catch(err => res.error.send(err, res));
        } else res.error.send('Permission denied', res)
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
        .catch(err => res.error.send(err,message, res));
    });
    app.delete('/stores/users/:id',       isLoggedIn, allowed('user_delete',   {send: true}),              (req, res) => {
        if (Number(req.user.user_id) !== Number(req.params.id)) {
            m.permissions.destroy({where: {user_id: req.params.id}})
            .then(result => {
                db.destroy({
                    table: m.users,
                    where: {user_id: req.params.id}
                })
                .then(result => res.send({result: true, message: 'User/Permissions deleted'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        } else res.send_error('You can not delete your own account', res);       
    });
};