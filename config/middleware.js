module.exports = (mw, fn) => {
    mw.isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) {
            if (req._parsedUrl.pathname === '/stores/password' || req._parsedUrl.pathname === '/stores/password/' + req.user.user_id || !req.user._reset) {
                fn.getPermissions(
                    req.user.user_id
                )
                .then(permissions => {
                    res.locals.permissions = permissions.dataValues;
                    return next();
                })
                .catch(err => {
                    console.log(err);
                    res.locals.permissions = [];
                    return next();
                });
            } else {
                req.flash('info', 'You must change your password before you can continue')
                res.redirect('/stores/password?user=' + req.user.user_id);
            };
        } else {
            req.flash('danger', 'You need to be signed in to do that!');
            res.redirect('/login');
        };
    };
};