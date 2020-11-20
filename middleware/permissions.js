module.exports = (m) => {
    return (req, res, next) => {
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
    };
};