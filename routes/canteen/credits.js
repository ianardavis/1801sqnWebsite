module.exports = (app, m, fn) => {
    app.get('/get/credits', fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        m.credits.findAndCountAll({
            include: [fn.inc.users.user()],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('credits', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
};