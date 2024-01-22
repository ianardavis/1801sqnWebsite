module.exports = (app, fn) => {
    app.get('/get/credits', fn.loggedIn, fn.permissions.check('pos_user'), (req, res) => {
        fn.credits.findAll(req.query)
        .then(results => fn.sendRes('credits', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
};