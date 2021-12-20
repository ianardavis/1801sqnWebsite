module.exports = (app, m, fn) => {
    app.get('/paid_in_outs',        fn.loggedIn(), fn.permissions.get('pay_in_out'),   (req, res) => res.render('canteen/paid_in_outs/index'));
    app.get('/paid_in_outs/:id',    fn.loggedIn(), fn.permissions.get('pay_in_out'),   (req, res) => res.render('canteen/paid_in_outs/show'));

    app.get('/get/paid_in_out',     fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        m.paid_in_outs.findOne({
            where: req.query.where,
            include: [
                fn.inc.users.user({as: 'user_paid_in_out'}),
                fn.inc.users.user(),
                fn.inc.canteen.holding()
            ]
        })
        .then(paid_in => res.send({success: true, result: paid_in}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/paid_in_outs',    fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        m.paid_in_outs.findAndCountAll({
            where: req.query.where,
            include: [
                fn.inc.users.user({as: 'user_paid_in_out'}),
                fn.inc.canteen.holding()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('paid_ins', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/paid_in_outs/:id',    fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        fn.paid_in_out.complete(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Pay Out Completed'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/paid_in_outs',       fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        if (!req.body.paid_in_out) fn.send_error(res, 'No details')
        else {
            fn.paid_in_out.create(req.body.paid_in_out, req.user.user_id)
            .then(result => res.send({success: true, message: 'Paid In/Out Added'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.delete('/paid_in_outs/:id', fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        fn.paid_in_out.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Pay Out Cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};