module.exports = () => {
    return (req, res, next) => {
        console.log(req.query.where);
        ['where', 'like', 'lt', 'gt', 'order', 'limit', 'offset'].forEach(e => {
            if (req.query[e]){
                try {
                    req.query[e] = JSON.parse(req.query[e]);
                } catch (err) {
                    console.log(`Error parsing query: ${e}`);
                    console.log(`Line: ${req.query[e]}`);
                    console.log(`Error: ${err}`);
                };
            };
        });
        res.locals.user     = req.user;
        res.locals.info     = req.flash('info');
        res.locals.danger   = req.flash('danger');
        res.locals.success  = req.flash('success');
        res.locals.partials = process.env.PARTIALS;
        res.locals.tab      = req.query.tab || 'details';
        next();
    };
};