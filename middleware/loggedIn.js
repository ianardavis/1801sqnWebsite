module.exports = fn => {
    fn.loggedIn = function () {
        return (req, res, next) => {
            if (req.isAuthenticated()) {
                if (
                    !req.user.reset ||
                    req._parsedUrl.pathname === `/password/${req.user.user_id}`
                ) {
                    next();
                } else {
                    if (req.user.reset) req.flash('info', 'You must change your password before you can continue')
                    res.redirect(`/password/${req.user.user_id}`);
                };
            } else {
                req.flash('danger', 'You need to be signed in to do that!');
                res.redirect(`/login?redirect=${req._parsedUrl.pathname}`);
            };
        };
    };
};