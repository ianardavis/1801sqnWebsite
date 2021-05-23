module.exports = () => {
    return (req, res, next) => {
        res.locals.user     = req.user;
        res.locals.info     = req.flash('info');
        res.locals.danger   = req.flash('danger');
        res.locals.success  = req.flash('success');
        res.locals.partials = process.env.PARTIALS;
        res.locals.tab      = req.query.tab || 'details';
        next();
    };
};