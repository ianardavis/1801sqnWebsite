module.exports = (app, m, fn) => {
    app.get('/sessions',     fn.loggedIn(), fn.permissions.get('access_sessions'),   (req, res) => res.render('canteen/sessions/index'));
    app.get('/sessions/:id', fn.loggedIn(), fn.permissions.get('access_sessions'),   (req, res) => res.render('canteen/sessions/show'));

    app.get('/get/sessions', fn.loggedIn(), fn.permissions.check('access_sessions'), (req, res) => {
        m.sessions.findAll({
            where: req.query,
            include: [
                fn.inc.users.user({as: 'user_open'}),
                fn.inc.users.user({as: 'user_close'}),
            ]
        })
        .then(sessions => res.send({success: true, result: sessions}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/session',  fn.loggedIn(), fn.permissions.check('access_sessions'), (req, res) => {
        fn.get(
            'sessions',
            req.query,
            [
                fn.inc.users.user({as: 'user_open'}),
                fn.inc.users.user({as: 'user_close'}),
            ]
        )
        .then(session => res.send({success: true, result: session}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/sessions',    fn.loggedIn(), fn.permissions.check('session_add'),     (req, res) => {
        fn.sessions.create(req.body.balance, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/sessions/:id', fn.loggedIn(), fn.permissions.check('session_edit'),    (req, res) => {
        fn.sessions.close(
            req.params.id,
            req.body.balance,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: `Session closed.\nTakings: £${result.takings.toFixed(2)}.\nCash In: £${result.cash_in.toFixed(2)}.`}))
        .catch(err => fn.send_error(res, err));
    });
};