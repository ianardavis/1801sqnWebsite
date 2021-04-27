module.exports = (m, cb) => {
    cb.get = function (permission, options = {}) {
        return function (req, res, next) {
            if (req.user) {
                m.findAll({
                    where:      {user_id: req.user.user_id},
                    attributes: ['permission']
                })
                .then(permissions => {
                    res.locals.permissions = {};
                    permissions.forEach(e => res.locals.permissions[e.permission] = true);
                    req.allowed = (res.locals.permissions[permission] ? true : false);
                    if (options.allow || res.locals.permissions[permission]) return next();
                    else {
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
    cb.check = function (permission, options = {}) {
        return function (req, res, next) {
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
                else res.send({success: false, error: `Permission denied - ${permission}`});
            })
            .catch(err => {
                console.log(err);
                res.send({success: false, error: `Error getting permission - ${err.message}`})
            });
        };
    };
};