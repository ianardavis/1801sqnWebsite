module.exports = (app, m, inc, fn) => {
    app.get('/pos',             fn.li(), fn.permissions.get('access_pos'),   (req, res) => {
        m.sessions.findAll({
            where: {_status: 1},
            attributes: ['session_id']
        })
        .then(sessions => {
            if (sessions.length !== 1) {
                req.flash('danger', `${sessions.length} sessions open`);
                res.redirect('/canteen');
            } else res.render('canteen/pos');
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/pos_pages',   fn.li(), fn.permissions.check('access_pos'), (req, res) => {
        m.pos_pages.findAll({
            include: [inc.pos_layouts()]
        })
        .then(pos_pages => res.send({success: true, result: pos_pages}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/pos_layouts', fn.li(), fn.permissions.check('access_pos'), (req, res) => {
        m.pos_layouts.findAll({
            include: [inc.items()]
        })
        .then(pos_layouts => res.send({success: true, result: pos_layouts}))
        .catch(err => fn.send_error(res, err));
    });
};