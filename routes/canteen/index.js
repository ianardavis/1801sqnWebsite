const inc = {}, op = require('sequelize').Op;
module.exports = (app, m) => {
    var permissions = require(`${process.env.ROOT}/middleware/permissions.js`)(m.canteen.permissions),
        allowed     = require(`${process.env.ROOT}/middleware/allowed.js`),
        fs          = require("fs");
    require('./includes.js')(inc, m);
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        if (file === 'includes.js' || file === 'functions') {
            
        } else if (file === 'permissions.js') {
            require(`./${file}`)(app, allowed, inc, permissions, {permissions: m.canteen.permissions, users: m.users.users})
        } else {
            require(`./${file}`)(app, allowed, inc, permissions, m.canteen)
        };
    });

    app.get('/canteen',                   permissions, allowed('access_canteen'), (req, res) => res.render('canteen/index'));

    app.get('/canteen/get/settings',      permissions, allowed('access_canteen'), (req, res) => {
        m.canteen.settings.findOne({where: req.query})
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => res.error.send(err, res));
    });
};