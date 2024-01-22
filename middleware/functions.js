module.exports = (m, fn) => {
    fn.permissions = {};
    fn.setSiteID = function(req, res, next) {
        m.sites.findOne({where: {site_id: req.user.site_id}})
        .then(site => {
            if (site) {
                req.session.site = site.dataValues;
                next();
            };
        })
    };
    fn.adminSiteOnly = function(req, res, next) {
        if (req.session.site.is_admin) {
            next();
        } else {
            req.flash('danger', 'Page only accessible from the admin site!');
            res.redirect('/stores');
        };
    };
    fn.loggedIn = function (req, res, next) {
        if (req.isAuthenticated()) {
            if (
                !req.user.reset ||
                req._parsedUrl.pathname === `/password/${req.user.user_id}`
            ) {
                next();
            } else {
                if (req.user.reset) req.flash('info', 'You must change your password before you can continue');
                res.redirect(`/password/${req.user.user_id}`);
            };
        } else {
            req.flash('danger', 'You need to be signed in to do that!');
            res.redirect(`/?redirect=${req._parsedUrl.pathname}`);
        };
    };
    fn.permissions.get = function (permission = '', allow = false) {
        return function (req, res, next) {
            res.locals.permissions = {};
            if (req.user) {
                return m.permissions.findAll({
                    where:      {
                        user_id: req.user.user_id,
                        site_id: req.session.site.site_id
                    },
                    attributes: ['permission']
                })
                .then(permissions => {
                    permissions.forEach(e => res.locals.permissions[e.permission] = true);
                    if (allow === true || res.locals.permissions[permission]) {
                        req.allowed = (res.locals.permissions[permission] ? true : false);
                        next();
                    } else {
                        req.flash('danger', `Permission denied - ${permission}`);
                        res.redirect('/');
                    };
                })
                .catch(err => {
                    console.error(err);
                    req.flash('danger', `Error getting permissions: ${err.message}`);
                    res.redirect('/');
                });
            } else if (allow === true) next()
            else {
                console.error('No user');
                req.flash('danger', 'No user!');
                res.redirect('/');
            };
        };
    };
    fn.permissions.check = function (_permission, allow = false) {
        return function (req, res, next) {
            return m.permissions.findOne({
                where: {
                    user_id:    req.user.user_id,
                    site_id:    req.session.site.site_id,
                    permission: _permission
                },
                attributes: ['permission']
            })
            .then(permission => {
                if (permission || allow) {
                    req.allowed = (permission);
                    next();
                } else res.send({success: false, message: `Permission denied - ${_permission}`});
            })
            .catch(err => {
                console.error(err);
                res.send({success: false, message: `Error getting permission - ${err.message}`})
            });
        };
    };
};