module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //ASYNC GET
    app.get('/stores/getreturnlines', isLoggedIn, allowed('access_return_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.return_lines,
            req.query
        )
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });
    //ASYNC GET
    app.get('/stores/getreturnlinesbysize', isLoggedIn, allowed('access_return_lines', {send: true}), (req, res) => {
        fn.getAll(
            m.return_lines,
            [inc.stock({
                as: 'stock',
                where: req.query,
                required: true
        })])
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });
    //ASYNC GET
    app.get('/stores/getreturns', isLoggedIn, allowed('access_returns', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.returns,
            req.query
        )
        .then(returns => res.send({result: true, returns: returns}))
        .catch(err => fn.send_error(err, res));
    });

    //POST
    app.post('/stores/returns', isLoggedIn, allowed('return_add', {send: true}), (req, res) => {
        let returnLines = req.body.returnLines.filter(line => (line !== '' && typeof(line) === 'string'));
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
                .catch(err => fn.error(err, req.query.src, req, res));
            } else fn.error(new Error('No user specified'), req.query.src, req, res);
        } else {
            req.flash('info', 'No lines selected');
            res.redirect(req.query.src);
        };
    });
};