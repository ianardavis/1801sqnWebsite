const passport = require('passport');
module.exports = (app, fn) => {
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
    app.post('/login', passport.authenticate('local', {failureRedirect: `/login`}), (req, res) => res.redirect(`${req.body.redirect || '/resources'}`));
};