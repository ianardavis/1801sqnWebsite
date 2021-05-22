module.exports = (app, m, inc, fn) => {
    app.get('/get/actions', fn.li(), fn.permissions.check('access_actions', {send: true}), (req, res) => {
        m.actions.findAll({
            where:      req.query,
            attributes: ['action_id', 'action', 'createdAt']
        })
        .then(actions => res.send({success: true, result: actions}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/action',  fn.li(), fn.permissions.check('access_actions', {send: true}), (req, res) => {
        m.actions.findOne({
            where: req.query,
            include: [
                inc.issue(),
                inc.order(),
                inc.stock(),
                inc.serial(),
                inc.location(),
                inc.nsn(),
                inc.demand(),
                inc.demand_line(),
                inc.loancard(),
                inc.loancard_line(),
                inc.user()
            ]
        })
        .then(action => res.send({success: true, result: action}))
        .catch(err => fn.send_error(res, err));
    });
};