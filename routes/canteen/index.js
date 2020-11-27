const inc = {}, 
      op = require('sequelize').Op;
module.exports = (app, m) => {
    var permissions = require(`${process.env.ROOT}/middleware/permissions.js`)(m.canteen.permissions),
        allowed     = require(`${process.env.ROOT}/middleware/allowed.js`),
        fs          = require("fs");
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        if (file === 'includes.js') {
            require(`./${file}`)(inc, m);
        } else {
            require(`./${file}`)(app, allowed, inc, permissions, m.canteen)
        };
    });

    app.get('/canteen',                   permissions, allowed('access_canteen'), (req, res) => res.render('canteen/index'));

    app.get('/canteen/get/settings',      permissions, allowed('access_canteen'), (req, res) => {
        m.canteen.settings.findOne({where: req.query})
        .then(settings => res.send({result: true, settings: settings}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/canteen/get/notifications', permissions, allowed('access_canteen'), (req, res) => {
        m.canteen.notifications.findAll({where: {user_id: req.user.user_id}})
        .then(notifications => res.send({result: true, notifications: notifications}))
        .catch(err => res.error.send(err, res));
    });
};