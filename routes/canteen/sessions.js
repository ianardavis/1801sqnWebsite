module.exports = (app, fn) => {
    app.get('/sessions',     fn.loggedIn(), fn.permissions.get('pos_user'),         (req, res) => res.render('canteen/sessions/index'));
    app.get('/sessions/:id', fn.loggedIn(), fn.permissions.get('pos_user'),         (req, res) => res.render('canteen/sessions/show'));

    app.get('/get/sessions', fn.loggedIn(), fn.permissions.check('pos_user'),       (req, res) => {
        fn.sessions.findAll(req.query)
        .then(results => fn.sendRes('sessions', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/session',  fn.loggedIn(), fn.permissions.check('pos_user'),       (req, res) => {
        fn.sessions.find(req.query.where)
        .then(session => res.send({success: true, result: session}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/sessions',    fn.loggedIn(), fn.permissions.check('pos_supervisor'), (req, res) => {
        fn.sessions.create(req.body.balance, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.put('/sessions/:id', fn.loggedIn(), fn.permissions.check('pos_supervisor'), (req, res) => {
        fn.sessions.close(
            req.params.id,
            req.body.balance,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: `Session closed.\nTakings: £${result.takings.toFixed(2)}.\nCash In: £${result.cash_in.toFixed(2)}.`}))
        .catch(err => fn.sendError(res, err));
    });
};