var obj = {};

obj.isLoggedIn = (req, res, next) => {
                    if (req.isAuthenticated()) return next();
                    req.flash('danger', 'You need to be signed in to do that!');
                    res.redirect('/login');
};
module.exports = obj;