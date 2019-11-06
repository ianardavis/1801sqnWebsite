var obj = {};

obj.isLoggedIn = (req, res, next) => {
    // put reset password code here!
    if (req.isAuthenticated()) return next();
    req.flash('danger', 'You need to be signed in to do that!');
    res.redirect('/login');
};
module.exports = obj;