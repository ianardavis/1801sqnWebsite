const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/pos',             permissions, allowed('access_pos'),               (req, res) => {
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
    app.get('/canteen/get/sale',        permissions, allowed('access_pos', {send: true}), (req, res) => {
        m.sessions.findAll({
            where: {_status: 1},
            attributes: ['session_id']
        })
        .then(sessions => {
            if (sessions.length !== 1) res.send({result: false, message: `${sessions.length} session(s) open`})
            else {
                return m.sales.findOrCreate({
                    where: {
                        session_id: sessions[0].session_id,
                        user_id:    req.user.user_id,
                        _status:    1
                    }
                })
                .then(([sale, created]) => res.send({result: true, sale: sale.sale_id}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/canteen/get/pos_pages',   permissions, allowed('access_pos', {send: true}), (req, res) => {
        m.pos_pages.findAll({
            include: [inc.pos_layouts()]
        })
        .then(pos_pages => res.send({result: true, pos_pages: pos_pages}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/canteen/get/pos_layouts', permissions, allowed('access_pos', {send: true}), (req, res) => {
        m.pos_layouts.findAll({
            include: [inc.items()]
        })
        .then(pos_layouts => res.send({result: true, pos_layouts: pos_layouts}))
        .catch(err => res.error.send(err, res));
    });
};