module.exports = (permission, options = {}) => {
    return (req, res, next) => {
        if (permission === '') {
            if (req.method === 'GET') {
                if (req._parsedUrl.pathname.split('/')[2].toLowerCase() === 'get' || req._parsedUrl.pathname.split('/')[2].toLowerCase() === 'count') {
                    permission = 'access_' + req._parsedUrl.pathname.split('/')[3];
                } else {
                    req.flash('danger', 'Invalid permission');
                    res.redirect('/resources');                
                };
            } else if (req.method === 'DELETE') {
                
            } else {
                req.flash('danger', 'Invalid permission');
                res.redirect('/resources');   
            };
        };
        req.allowed = (res.locals.permissions[permission] === true);
        if (req.allowed || options.allow) next();
        else {
            if (options.send) res.send({result: false, error: 'Permission denied - ' + permission})
            else {
                req.flash('danger', 'Permission denied - ' + permission);
                res.redirect('/resources');
            };
        };
    };
};