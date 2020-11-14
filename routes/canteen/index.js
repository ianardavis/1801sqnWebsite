const inc = {}, 
      op = require('sequelize').Op;
module.exports = (app, m) => {
    var allowed  = require(`${process.env.ROOT}/middleware/allowed.js`),
        loggedIn = require(`${process.env.ROOT}/middleware/loggedIn.js`)(m.canteen.permissions),
        fs       = require("fs");
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        if (file === 'include.js') {
            require(`./${file}`)(inc, m);
        } else {
            require(`./${file}`)(app, allowed, inc, loggedIn, m.canteen)
        };
    });

    app.get('/canteen',                   loggedIn, allowed('access_canteen'), (req, res) => res.render('canteen/index'));
    
    app.get('/canteen/get/notifications', loggedIn, allowed('access_canteen'), (req, res) => {
        m.canteen.notifications.findAll({where: {user_id: req.user.user_id}})
        .then(notifications => res.send({result: true, notifications: notifications}))
        .catch(err => res.error.send(err, res));
    });
};