module.exports = (m, fn) => {
    fn.permissions = {};
    fn.permissions.get = function (permission = '', allow = false) {
        return function (req, res, next) {
            res.locals.permissions = {};
            if (req.user) {
                return m.findAll({
                    where:      {user_id: req.user.user_id},
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
            return m.findOne({
                where: {
                    user_id:    req.user.user_id,
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