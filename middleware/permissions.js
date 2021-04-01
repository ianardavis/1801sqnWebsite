module.exports = (m, cb) => {
    cb.get = function (req, res, next) {
        if (req.user) {
            m.findAll({
                where:      {user_id: req.user.user_id},
                attributes: ['permission']
            })
            .then(permissions => {
                res.locals.permissions = {};
                permissions.forEach(e => res.locals.permissions[e.permission] = true);
                return next();
            })
            .catch(err => {
                console.log(err);
                res.locals.permissions = {};
                return next();
            });
        } else {
        };
    };
    cb.check = function (permission, options = {}) {
        return function (req, res, next) {
            if (res.locals.permissions) {
                req.allowed = (res.locals.permissions[permission] === true);
                if (req.allowed || options.allow) next();
                else {
                    if (options.send) res.send({success: false, error: `Permission denied - ${permission}`})
                    else {
                        req.flash('danger', `Permission denied - ${permission}`);
                        res.redirect('/resources');
                    };
                };
            } else {
                return m.findOne({
                    where: {
                        user_id:    req.user.user_id,
                        permission: permission
                    },
                    attributes: ['permission']
                })
                .then(permission => {
                    req.allowed = (permission);
                    if (req.allowed || options.allow) next();
                    else {
                        if (options.send) res.send({success: false, error: `Permission denied - ${permission}`})
                        else {
                            req.flash('danger', `Permission denied - ${permission}`);
                            res.redirect('/resources');
                        };
                    };
                })
                .catch(err => {
                    req.flash('danger', `Error getting permission - ${permission}`);
                    res.redirect('/resources');
                });
            };
        };
    };
};