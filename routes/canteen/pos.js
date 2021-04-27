module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/pos',             li, pm.get('access_pos'),   (req, res) => {
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
        .catch(err => send_error(res, err));
    });
    app.get('/get/pos_pages',   li, pm.check('access_pos'), (req, res) => {
        m.pos_pages.findAll({
            include: [inc.pos_layouts()]
        })
        .then(pos_pages => res.send({success: true, result: pos_pages}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/pos_layouts', li, pm.check('access_pos'), (req, res) => {
        m.pos_layouts.findAll({
            include: [inc.items()]
        })
        .then(pos_layouts => res.send({success: true, result: pos_layouts}))
        .catch(err => send_error(res, err));
    });
};