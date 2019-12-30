const   passport = require('passport'),
        mw       = require('../config/middleware');

module.exports = (app, m) => {
    app.get("/", (req, res) => {
        res.redirect('/resources');
        // res.render("index");
    });
    
    app.get("/resources", (req, res) => res.render("resources"));
    
    app.get('/login', (req, res) => res.render('login'));

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
    
    app.post('/login', passport.authenticate('local-signin', {
        failureRedirect: 'login',
    }), (req, res) => res.redirect('/stores'));
    
    app.get("*",  (req, res) => res.render("404"));
};