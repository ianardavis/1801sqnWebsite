module.exports = (permission, options = {}) => {
    return (req, res, next) => {
        req.allowed = (res.locals.permissions[permission] === true);
        if (req.allowed || options.allow) next();
        else {
            if (options.send) res.send({success: false, error: `Permission denied - ${permission}`})
            else {
                req.flash('danger', `Permission denied - ${permission}`);
                res.redirect('/resources');
            };
        };
    };
};