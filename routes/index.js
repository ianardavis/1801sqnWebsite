const passport = require('passport');
module.exports = function (app, m) {
    let fs   = require("fs"),
        path = require("path"),
        pm   = {},
        op   = require('sequelize').Op,
        li   = require(`${process.env.ROOT}/middleware/loggedIn.js`)();

    require(`${process.env.ROOT}/middleware/permissions.js`)(m.permissions, pm);
    let send_error = function (res, err) {
        if (err.message) console.log(err);
        res.send({success: false, message: err.message || err});
    };
    fs
        .readdirSync(__dirname)
        .filter(function(file) {
            return (file.indexOf(".") === -1) && !["functions"].includes(file);
        })
        .forEach(folder => require(`./${folder}`)(fs, app, m, pm, op, li, send_error));

    app.get("/",           (req, res) => res.render("index"));
    app.get("/resources",  (req, res) => res.render("resources"));
    app.get('/login',      (req, res) => {
        if (req.isAuthenticated()) {
            req.flash('info', 'You are already logged in');
            res.redirect(req.query.redirect || '/stores');
        } else res.render('login', {redirect: req.query.redirect});
    });
    app.get('/logout', li, (req, res) => {
        req.logout();
        res.redirect('/');
    });
    app.get("*",           (req, res) => res.render("404"));
    app.get("/get/*",  li, (req, res) => send_error(res, 'Invalid request'));
    
    app.post('/login', passport.authenticate('local', {failureRedirect: `/login`}), (req, res) => res.redirect(`${req.body.redirect || '/'}`));
};