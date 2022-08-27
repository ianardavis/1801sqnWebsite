module.exports = (app, m, fn) => {
    app.get('/get/giftaid',  fn.loggedIn(),                                     (req, res) => {
        m.giftaid.findOne({where: req.query.where})
        .then(giftaid => {
            if (giftaid) res.send({success: true, result: giftaid})
            else res.send({success: false, message: 'Giftaid record not found'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/giftaids', fn.loggedIn(),                                     (req, res) => {
        m.giftaid.findAll({
            where: req.query.where
        })
        .then(results => fn.send_res('giftaid', res, {rows: results}, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/giftaid',     fn.loggedIn(), fn.permissions.check('user_admin'), (req, res) => {
        if (!req.body.giftaid) fn.send_error(res, 'No record')
        else {
            fn.giftaid.create(req.body.giftaid)
            .then(giftaid => res.send({success: true, message: 'Giftaid record added'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/giftaid/:id',  fn.loggedIn(), fn.permissions.check('user_admin'), (req, res) => {
        if (!req.body.giftaid) fn.send_error(res, 'No record')
        else {
            fn.giftaid.create(req.body.giftaid)
            .then(giftaid => res.send({success: true, message: 'Giftaid record added'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    // app.delete('/giftaid')
};