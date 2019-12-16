module.exports = function (permission, redirect, getOne, m) {
    return (req, res, next) => {
        getOne(
            m,
            {user_id: req.user.user_id},
            [],
            [permission]
        )
        .then(allowed => {
            if (allowed[permission]) {
                req.allowed = true;
                next();
            } else {
                if (redirect) {
                    req.flash('danger', 'Permission denied!');
                    res.redirect('back');
                } else {
                    req.allowed = false;
                    next();
                };
            };
        })
        .catch(err => {
            console.log(err);
            if (redirect) {
                req.flash('danger', 'Permission denied!');
                res.redirect('back');
            } else {
                req.allowed = false;
                next();
            };
        });
        return null;
    };
};