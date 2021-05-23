const passport = require('passport');
module.exports = function (app, m) {
    let fs = require("fs"), fn = {};
    fn.op = require('sequelize').Op;
    require(`${process.env.ROOT}/middleware/loggedIn.js`)(fn);
    require(`${process.env.ROOT}/middleware/permissions.js`)(m.permissions, fn);
    require(`${process.env.ROOT}/functions`)(fs, m, fn);
    fs
        .readdirSync(__dirname)
        .filter(e => e.indexOf(".") === -1)
        .forEach(folder => require(`./${folder}`)(fs, app, m, fn));

    app.get("/",                (req, res) => res.render("index"));
    app.get("/resources",       (req, res) => res.render("resources"));
    app.get('/login',           (req, res) => {
        if (req.isAuthenticated()) {
            req.flash('info', 'You are already logged in');
            res.redirect(req.query.redirect || '/stores');
        } else res.render('login', {redirect: req.query.redirect});
    });
    app.get('/logout', fn.li(), (req, res) => {
        req.logout();
        res.redirect('/');
    });
    app.get("*",                (req, res) => res.render("404"));
    app.get("/get/*",  fn.li(), (req, res) => fn.send_error(res, 'Invalid request'));
    
    app.post('/login', passport.authenticate('local', {failureRedirect: `/login`}), (req, res) => res.redirect(`${req.body.redirect || '/'}`));
};