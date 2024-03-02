const passport = require('passport');
module.exports = (app, fn) => {
    app.get("/", (req, res) => {
        if (req.isAuthenticated()) {
            req.flash('info', 'You are already logged in');
            fn.redirect(res, req.query.redirect || '/index');

        } else {
            res.render('site/login', {redirect: req.query.redirect});
        
        };
    });
    
    app.get('/logout', fn.loggedIn, (req, res) => {
        req.logout(function(err) {
            if (err) return next(err);
            fn.redirect(res, '/');
        });
    });

    app.post('/login', passport.authenticate('local', {failureRedirect: `/`}), fn.setSiteID, (req, res) => {
        fn.redirect(res, `${req.body.redirect || '/index'}`);
    });
};