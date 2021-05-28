module.exports = (app, m, inc, fn) => {
    app.get('/get/actions', fn.li(), fn.permissions.check('access_actions', {send: true}), (req, res) => {
        m.actions.findAll({
            include: [inc.action_links({where: req.query})]
        })
        .then(actions => res.send({success: true, result: actions}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action',  fn.li(), fn.permissions.check('access_actions', {send: true}), (req, res) => {
        m.actions.findOne({
            where: req.query,
            include: [inc.user()]
        })
        .then(action => res.send({success: true, result: action}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action_links', fn.li(), fn.permissions.check('access_actions', {send: true}), (req, res) => {
        m.action_links.findAll({where: req.query})
        .then(links => res.send({success: true, result: links}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action_link',  fn.li(), fn.permissions.check('access_actions', {send: true}), (req, res) => {
        m.action_links.findOne({where: req.query})
        .then(link => res.send({success: true, result: link}))
        .catch(err => fn.send_error(res, err));
    });
};