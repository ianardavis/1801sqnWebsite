module.exports = () => {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            if (
                !req.user._reset ||
                req._parsedUrl.pathname === `/stores/users/${req.user.user_id}/password`
            ) {
                next();
                // return null;
            } else {
                if (req.user._reset) req.flash('info', 'You must change your password before you can continue')
                res.redirect(`/stores/users/${req.user.user_id}/password`);
            };
        } else if (['canteen', 'stores', 'users'].includes(req._parsedUrl.pathname.split('/')[1])) {
            req.flash('danger', 'You need to be signed in to do that!');
            res.redirect(`/login?redirect=${req._parsedUrl.pathname.split('/')[1]}`);
        } else {
            next();
            // return null;
        };
    };
};