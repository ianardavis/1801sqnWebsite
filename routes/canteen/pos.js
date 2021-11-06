module.exports = (app, m, fn) => {
    app.get('/pos',                fn.loggedIn(), fn.permissions.get('pos_user'),        (req, res) => {
        m.sessions.findAll({where: {status: 1}})
        .then(sessions => {
            if (sessions.length !== 1) {
                req.flash('danger', `${sessions.length} sessions open`);
                res.redirect('/canteen');
            } else res.render('canteen/pos/show');
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/pos_pages',      fn.loggedIn(), fn.permissions.check('pos_user'),      (req, res) => {
        m.pos_pages.findAll()
        .then(pos_pages => res.send({success: true, result: pos_pages}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/pos_layouts',    fn.loggedIn(), fn.permissions.check('pos_user'),      (req, res) => {
        m.pos_layouts.findAll({
            include: [fn.inc.canteen.item()]
        })
        .then(pos_layouts => res.send({success: true, result: pos_layouts}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/pos_layout',     fn.loggedIn(), fn.permissions.check('pos_user'),      (req, res) => {
        m.pos_layouts.findOne({
            where: JSON.parse(req.query.where),
            include: [fn.inc.canteen.item()]
        })
        .then(pos_layout => res.send({success: true, result: pos_layout}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/pos_layouts',        fn.loggedIn(), fn.permissions.check('pos_supervisor'), (req, res) => {
        fn.pos_layouts.edit(req.body.layout)
        .then(result => res.send({success: true, message: 'Button saved'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/pos_layouts/:id', fn.loggedIn(), fn.permissions.check('pos_supervisor'), (req, res) => {
        fn.get('pos_layouts', {pos_layout_id: req.params.id})
        .then(layout => {
            return layout.destroy()
            .then(result => {
                if (!result) fn.send_error(res, 'Layout not deleted')
                else res.send({success: true, message: 'Layout deleted'});
            })
            .catch(err => fn.send_error(res, err))
        })
        .catch(err => fn.send_error(res, err));
    });
};