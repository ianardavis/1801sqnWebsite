module.exports = (m, m_users = null) => {
    return (req, res, next) => {
        return m.findAll({
            where:      {user_id: req.user.user_id},
            attributes: ['_permission']
        })
        .then(permissions => {
            res.locals.permissions = {};
            permissions.forEach(e => res.locals.permissions[e._permission] = true);
            if (!m_users) return next();
            else {
                return m_users.findAll({
                    where:      {user_id: req.user.user_id},
                    attributes: ['_permission']
                })
                .then(permissions => {
                    permissions.forEach(e => res.locals.permissions[e._permission] = true);
                    return next();
                })
                .catch(err => {
                    console.log(err);
                    return next();
                });
            };
        })
        .catch(err => {
            console.log(err);
            res.locals.permissions = {};
            return next();
        });
    };
};