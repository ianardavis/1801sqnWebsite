const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/get/credits', permissions, allowed('access_credits', {send: true}), (req, res) => {
        m.credits.findAll({include: [inc.users()]})
        .then(credits => res.send({success: true, result: credits}))
        .catch(err => res.error.send(err, res));
    });
};