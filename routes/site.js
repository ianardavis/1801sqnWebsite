const   express     = require("express"),
        router      = express.Router(),
        passport    = require('passport'),
        mw          = require('../config/middleware');
        
router.get("/", (req, res) => {
    res.redirect('/resources');
    // res.render("index");
})

router.get("/resources", (req, res) => {
    res.render("resources");
})

router.get('/login', (req, res) => {
    res.render('login');
})
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})
router.post('/login', passport.authenticate('local-signin', {
    failureRedirect: 'login',
}), (req, res) => {
    res.redirect('/stores');
})

router.get("*",  (req, res) => {
    res.render("404");
})

module.exports = router;