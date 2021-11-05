module.exports = (app, m, fn) => {
    app.get('/get/actions',      fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        m.actions.findAll({
            include: [
                fn.inc.stores.action_links({where: req.query})
            ]
        })
        .then(actions => res.send({success: true, result: actions}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action',       fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        fn.get(
            'actions',
            req.query,
            [fn.inc.users.user()]
        )
        .then(action => res.send({success: true, result: action}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action_links', fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        m.action_links.findAll({where: req.query})
        .then(links => res.send({success: true, result: links}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action_link',  fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        fn.get(
            'action_links',
            req.query
        )
        .then(link => res.send({success: true, result: link}))
        .catch(err => fn.send_error(res, err));
    });
};