const passport = require('passport');;
module.exports = app => {
    app.get("/",          (req, res) => res.render("index"));
    app.get("/resources", (req, res) => res.render("resources"));
    app.get('/login',     (req, res) => {
        if (req.isAuthenticated()) {
            req.flash('info', 'You are already logged in');
            res.redirect(req.query.redirect || '/stores');
        } else res.render('login', {redirect: req.query.redirect});
    });
    app.get('/logout',    (req, res) => {
        req.logout();
        res.redirect('/');
    });
    app.get("*",          (req, res) => res.render("404"));
    
    app.post('/login', passport.authenticate('local-signin', {failureRedirect: `/login`}), (req, res) => res.redirect(`/${req.query.redirect || 'stores'}`));
};