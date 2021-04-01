module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/actions', li, pm.check('access_actions', {send: true}), (req, res) => {
        m.actions.findAll({
            where:      req.query,
            attributes: ['action_id', 'action', 'createdAt']
        })
        .then(actions => res.send({success: true, result: actions}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/action',  li, pm.check('access_actions', {send: true}), (req, res) => {
        m.actions.findOne({
            where:   req.query,
            include: [
                inc.issue(),
                inc.order(),
                inc.stock(),
                inc.serial(),
                inc.location(),
                inc.nsn(),
                inc.demand_lines({as: 'demand_line'}),
                inc.loancard_lines({as: 'loancard_line'}),
                inc.user()
            ]
        })
        .then(action => res.send({success: true, result: action}))
        .catch(err => send_error(res, err));
    });
};