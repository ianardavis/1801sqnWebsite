module.exports = () => {
    return (req, res, next) => {
        res.error = {};
        res.error.send = function (err, res) {
            let message = '';
            if (typeof(err) === 'string') message = err
            else message = err.message;
            console.log(err);
            res.send({result: false, error: message});
        };
        res.error.redirect = function (err, req, res) {
            console.log(err);
            req.flash('danger', err.message);
            res.redirect('/');
        };
        res.locals.user      = req.user;
        res.locals.info      = req.flash('info');
        res.locals.danger    = req.flash('danger');
        res.locals.success   = req.flash('success');
        res.locals.partials  = process.env.PARTIALS;
        res.locals.tab       = req.query.tab || 'details';
        next();
    };
};