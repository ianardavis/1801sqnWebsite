const inc = {}, op = require('sequelize').Op;
module.exports = (app, m) => {
    var pm = require(`${process.env.ROOT}/middleware/permissions.js`)(m.canteen.permissions, m.users.permissions),
        al     = require(`${process.env.ROOT}/middleware/allowed.js`),
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
            require(`./${file}`)(app, al, inc, pm, {permissions: m.canteen.permissions, users: m.users.users})
        } else {
            require(`./${file}`)(app, al, inc, pm, m.canteen)
        };
    });

    app.get('/canteen',                   pm, al('access_canteen'), (req, res) => res.render('canteen/index'));

    app.get('/canteen/get/settings',      pm, al('access_canteen'), (req, res) => {
        m.canteen.settings.findOne({where: req.query})
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => res.error.send(err, res));
    });
};