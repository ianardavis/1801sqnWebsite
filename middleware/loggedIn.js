module.exports = fn => {
    fn.li = function () {
        return (req, res, next) => {
            if (req.isAuthenticated()) {
                if (
                    !req.user.reset ||
                    req._parsedUrl.pathname === `/users/${req.user.user_id}/password`
                ) {
                    next();
                } else {
                    if (req.user.reset) req.flash('info', 'You must change your password before you can continue')
                    res.redirect(`/users/${req.user.user_id}/password`);
                };
            } else {
                req.flash('danger', 'You need to be signed in to do that!');
                res.redirect(`/login?redirect=${req._parsedUrl.pathname}`);
            };
        };
    };
};