module.exports = (app, m, inc, fn) => {
    app.get('/paid_in_out',      fn.loggedIn(), fn.permissions.get('access_paid_in_outs'),   (req, res) => res.render('canteen/paid_in_outs/index'));
    
    app.get('/get/paid_in_out',  fn.loggedIn(), fn.permissions.check('access_paid_in_outs'), (req, res) => {
        m.paid_in_outs.findOne({
            where: req.query,
            include: [
                inc.user({as: 'user_paid_in_out'}),
                inc.user(),
                inc.holding()
            ]
        })
        .then(paid_in => res.send({success: true, result: paid_in}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/paid_in_outs', fn.loggedIn(), fn.permissions.check('access_paid_in_outs'), (req, res) => {
        m.paid_in_outs.findAll({
            where: req.query,
            include: [
                inc.user({as: 'user_paid_in_out'}),
                inc.holding()
            ]
        })
        .then(paid_ins => res.send({success: true, result: paid_ins}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/paid_in_outs',    fn.loggedIn(), fn.permissions.check('paid_in_out_add'),     (req, res) => {
        if (!req.body.paid_in_out) fn.send_error(res, 'No details')
        else {
            fn.paid_in_out.create(req.body.paid_in_out, req.user.user_id)
            .then(result => res.send({success: true, message: 'Paid In Added'}))
            .catch(err => fn.send_error(res, err));
        };
    });
};