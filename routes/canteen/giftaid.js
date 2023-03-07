module.exports = (app, fn) => {
    app.get('/get/giftaid',  fn.loggedIn(),                                     (req, res) => {
        fn.giftaid.get(req.query.where)
        .then(giftaid => res.send({success: true, result: giftaid}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/giftaids', fn.loggedIn(),                                     (req, res) => {
        fn.giftaid.getAll(req.query.where, fn.pagination(req.query))
        .then(results => fn.send_res('giftaid', res, {rows: results}, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/giftaid',     fn.loggedIn(), fn.permissions.check('user_admin'), (req, res) => {
        fn.giftaid.create(req.body.giftaid)
        .then(giftaid => res.send({success: true, message: 'Giftaid record added'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/giftaid/:id',  fn.loggedIn(), fn.permissions.check('user_admin'), (req, res) => {
        fn.giftaid.edit(req.params.id, req.body.giftaid)
        .then(result => res.send({success: true, message: 'Giftaid record added'}))
        .catch(err => fn.send_error(res, err));
    });
    // app.delete('/giftaid')
};