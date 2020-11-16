module.exports = (m) => {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            if (
                !req.user._reset ||
                req._parsedUrl.pathname === `/stores/users/${req.user.user_id}/password`
            ) {
                return m.findAll({
                    where: {user_id: req.user.user_id},
                    attributes: ['_permission']
                })
                .then(permissions => {
                    res.locals.permissions = {};
                    permissions.forEach(e => res.locals.permissions[e._permission] = true);
                    next();
                    return null;
                })
                .catch(err => {
                    console.log(err);
                    res.locals.permissions = [];
                    next();
                    return null;
                });
            } else {
                req.flash('info', 'You must change your password before you can continue')
                res.redirect(`/stores/users/${req.user.user_id}/password`);
            };
        } else {
            req.flash('danger', 'You need to be signed in to do that!');
            res.redirect(`/login?redirect=${req.route.path.split('/')[1]}`);
        };
    };
};