module.exports = (app, m, fn) => {
    app.get('/writeoffs',     fn.loggedIn(), fn.permissions.get('access_writeoffs'),   (req, res) => res.render('canteen/writeoffs/index'));
    app.get('/writeoffs/:id', fn.loggedIn(), fn.permissions.get('access_writeoffs'),   (req, res) => res.render('canteen/writeoffs/show'));
    
    app.get('/get/writeoffs', fn.loggedIn(), fn.permissions.check('access_writeoffs'), (req, res) => {
        m.writeoffs.findAll({
            include: [
                fn.inc.users.user(),
                fn.inc.canteen.item()
            ],
            where: req.query
        })
        .then(writeoffs => res.send({success: true, result: writeoffs}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/writeoff',  fn.loggedIn(), fn.permissions.check('access_writeoffs'), (req, res) => {
        fn.get(
            'writeoffs',
            req.query,
            [fn.inc.users.user()]
        )
        .then(writeoff => res.send({success: true, result: writeoff}))
        .catch(err => fn.send_error(res, err))
    });

    app.post('/writeoffs',    fn.loggedIn(), fn.permissions.check('writeoff_add'),     (req, res) => {
        if (!req.body.writeoff) fn.send_error(res, 'No body')
        else {
            fn.writeoffs.create(req.body.writeoff, req.user.user_Id)
            .then(result => res.send({success: true, message: 'Stock written off'}))
            .catch(err => fn.send_error(res, err));
        };
    });
};