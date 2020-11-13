const inc = {};
module.exports = (app, m) => {
    var allowed  = require(`${process.env.ROOT}/middleware/allowed.js`),
        loggedIn = require(`${process.env.ROOT}/middleware/loggedIn.js`)(m.users.permissions);
    require('./includes')(inc, m);
    require('./async')(app, allowed, loggedIn, m);

    app.get('/users', loggedIn, (req, res) => res.render('users/index'));
};