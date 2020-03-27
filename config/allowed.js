module.exports = (permission, redirect = true) => {
    return (req, res, next) => {
        req.allowed = (res.locals.permissions[permission] === 1);
        if (res.locals.permissions[permission]) next();
        else {
            if (redirect) {
                req.flash('danger', 'Permission denied!');
                res.redirect('/resources');
            } else next();
        };
    };
};