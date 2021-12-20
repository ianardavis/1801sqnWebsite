module.exports = (app, m, fn) => {
    app.get('/get/statuses', fn.loggedIn(), (req, res) => {
        m.statuses.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('statuses', res, results, req.query))
        .catch(err =>     fn.send_error(res, err));
    });
};