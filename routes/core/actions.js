module.exports = (app, m, fn) => {
    app.get('/get/actions',      fn.loggedIn(), (req, res) => {
        m.actions.findAndCountAll({
            include: [{
                model: m.action_links,
                as:    'links',
                where: req.query.where
            }],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('actions', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action',       fn.loggedIn(), (req, res) => {
        fn.get(
            'actions',
            req.query.where,
            [fn.inc.users.user()]
        )
        .then(action => res.send({success: true, result: action}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action_links', fn.loggedIn(), (req, res) => {
        m.action_links.findAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(links => res.send({success: true, result: links}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action_link',  fn.loggedIn(), (req, res) => {
        fn.get(
            'action_links',
            req.query.where
        )
        .then(link => res.send({success: true, result: link}))
        .catch(err => fn.send_error(res, err));
    });
};