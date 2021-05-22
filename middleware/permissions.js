module.exports = (m, fn) => {
    fn.permissions = {};
    fn.permissions.get = function (permission, options = {}) {
        return function (req, res, next) {
            if (req.user) {
                return m.findAll({
                    where:      {user_id: req.user.user_id},
                    attributes: ['permission']
                })
                .then(permissions => {
                    console.log(permissions)
                    res.locals.permissions = {};
                    permissions.forEach(e => res.locals.permissions[e.permission] = true);
                    if (res.locals.permissions[permission] || options.allow) {
                        req.allowed = (res.locals.permissions[permission] ? true : false);
                        next();
                    } else {
                        req.flash('danger', `Permission denied - ${permission}`);
                        res.redirect('/resources');
                    };
                })
                .catch(err => {
                    console.log(err);
                    req.flash('danger', `Error getting permissions: ${err.message}`);
                    res.redirect('/resources');
                });
            } else {
                console.log('No user');
                req.flash('danger', 'No user!');
                res.redirect('/resources');
            };
        };
    };
    fn.permissions.check = function (_permission, options = {}) {
        return function (req, res, next) {
            return m.findOne({
                where: {
                    user_id:    req.user.user_id,
                    permission: _permission
                },
                attributes: ['permission']
            })
            .then(permission => {
                if (permission || options.allow) {
                    req.allowed = (permission);
                    next();
                } else res.send({success: false, error: `Permission denied - ${_permission}`});
            })
            .catch(err => {
                console.log(err);
                res.send({success: false, error: `Error getting permission - ${err.message}`})
            });
        };
    };
};