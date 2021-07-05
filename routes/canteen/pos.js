module.exports = (app, m, fn) => {
    app.get('/pos',             fn.loggedIn(), fn.permissions.get('access_pos'),        (req, res) => {
        m.sessions.findAll({where: {status: 1}})
        .then(sessions => {
            if (sessions.length !== 1) {
                req.flash('danger', `${sessions.length} sessions open`);
                res.redirect('/canteen');
            } else res.render('canteen/pos/show');
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/pos_pages',   fn.loggedIn(), fn.permissions.check('access_pos'),      (req, res) => {
        m.pos_pages.findAll()
        .then(pos_pages => res.send({success: true, result: pos_pages}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/pos_layouts', fn.loggedIn(), fn.permissions.check('access_pos'),      (req, res) => {
        m.pos_layouts.findAll({
            include: [fn.inc.canteen.item()]
        })
        .then(pos_layouts => res.send({success: true, result: pos_layouts}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/pos_layout',  fn.loggedIn(), fn.permissions.check('access_pos'),      (req, res) => {
        m.pos_layouts.findOne({
            where: req.query,
            include: [fn.inc.canteen.item()]
        })
        .then(pos_layout => res.send({success: true, result: pos_layout}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/pos_layouts',     fn.loggedIn(), fn.permissions.check('pos_layout_edit'), (req, res) => {
        fn.pos_layouts.edit(req.body.layout)
        .then(result => res.send({success: true, message: 'Button saved'}))
        .catch(err => fn.send_error(res, err));
    });
};