const   mw = {},
        fn = {};

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // New Logic
    app.post('/stores/returns', mw.isLoggedIn, allowed('issues_return', true, fn.getOne, m.permissions), (req, res) => {
        var returnLines = req.body.returnLines.filter(line => (line !== '' && typeof(line) === 'string'));
        if (returnLines.length > 0) {
            if (req.body.returnLines) {
                fn.createReturn(
                    req.body.from,
                    returnLines,
                    req.user.user_id
                )
                .then(return_id => {
                    req.flash('success', 'Lines returned, ID: ' + return_id);
                    res.redirect(req.query.src);
                })
                .catch(err => {
                    fn.error(err, req.query.src, req, res);
                });
            } else {
                fn.error(new Error('No user specified'), req.query.src, req, res);
            };
        } else {
            req.flash('info', 'No lines selected');
            res.redirect(req.query.src);
        };
    });
};