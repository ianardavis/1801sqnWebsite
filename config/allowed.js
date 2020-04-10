module.exports = (permission, options = {}) => {
    return (req, res, next) => {
        req.allowed = (res.locals.permissions[permission] === 1);
        if (res.locals.permissions[permission] || options.allow) next();
        else {
            if (options.send) res.send({result: false, error: 'Permission denied'})
            else {
                req.flash('danger', 'Permission denied');
                res.redirect('/resources');
            };
        };
    };
};