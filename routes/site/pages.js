const passport = require('passport');
module.exports = (app, fn) => {
    app.get("/", (req, res) => {
        if (req.isAuthenticated()) {
            req.flash('info', 'You are already logged in');
            res.redirect(req.query.redirect || '/stores');

        } else {
            res.render('site/login', {redirect: req.query.redirect});
        
        };
    });
    
    app.get('/logout', fn.loggedIn(), (req, res) => {
        req.logout(function(err) {
            if (err) return next(err);
            res.redirect('/');
        });
    });

    function setSiteID(req, res, next) {
        req.session.site_id = req.user.site_id;
        next();
    };
    app.post('/login', passport.authenticate('local', {failureRedirect: `/`}), setSiteID, (req, res) => res.redirect(`${req.body.redirect || '/stores'}`));
};