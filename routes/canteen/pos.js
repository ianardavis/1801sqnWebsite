const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    app.get('/canteen/pos',             pm, al('access_pos'),               (req, res) => {
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
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/get/pos_pages',   pm, al('access_pos', {send: true}), (req, res) => {
        m.pos_pages.findAll({
            include: [inc.pos_layouts()]
        })
        .then(pos_pages => res.send({success: true, result: pos_pages}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/canteen/get/pos_layouts', pm, al('access_pos', {send: true}), (req, res) => {
        m.pos_layouts.findAll({
            include: [inc.items()]
        })
        .then(pos_layouts => res.send({success: true, result: pos_layouts}))
        .catch(err => res.error.send(err, res));
    });
};