module.exports = (mw, m, getPermissions) => {
    mw.isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) {
            if ('/stores/users/' + req.user.user_id + '/password' ||
                !req.user._reset
                ) {
                getPermissions({
                    m: {permissions: m.permissions},
                    user_id: req.user.user_id
                })
                .then(permissions => {
                    res.locals.permissions = permissions;
                    return next();
                })
                .catch(err => {
                    console.log(err);
                    res.locals.permissions = [];
                    return next();
                });
            } else {
                req.flash('info', 'You must change your password before you can continue')
                res.redirect('/stores/users/' + req.user.user_id + '/password');
            };
        } else {
            req.flash('danger', 'You need to be signed in to do that!');
            res.redirect('/login?redirect=' + req.route.path.split('/')[1]);
        };
    };
};