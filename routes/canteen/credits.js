module.exports = (app, fn) => {
    app.get('/get/credits', fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.credits.get_all(fn.pagination(req.query))
        .then(results => fn.send_res('credits', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
};