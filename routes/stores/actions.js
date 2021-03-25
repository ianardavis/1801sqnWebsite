module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/actions', pm.check('access_actions', {send: true}), (req, res) => {
        m.actions.findAll({
            where:      req.query,
            attributes: ['action_id', '_action', 'createdAt']
        })
        .then(actions => res.send({success: true, result: actions}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/action' , pm.check('access_actions', {send: true}), (req, res) => {
        m.actions.findOne({
            where:   req.query,
            include: [
                inc.issues(),
                inc.orders(),
                inc.stocks({as: 'stock'}),
                inc.serials({as: 'serial'}),
                inc.locations({as: 'location'}),
                inc.nsns({as: 'nsn'}),
                inc.demand_lines({as: 'demand_line'}),
                inc.loancard_lines({as: 'loancard_line'}),
                inc.users()
            ]
        })
        .then(action => res.send({success: true, result: action}))
        .catch(err => res.error.send(err, res));
    });
};