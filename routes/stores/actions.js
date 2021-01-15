const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/get/actions', pm, al('access_actions', {send: true}), (req, res) => {
        m.stores.actions.findAll({
            where:      req.query,
            attributes: ['action_id', '_action', 'createdAt']
        })
        .then(actions => res.send({success: true, result: actions}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/action' , pm, al('access_actions', {send: true}), (req, res) => {
        m.stores.actions.findOne({
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