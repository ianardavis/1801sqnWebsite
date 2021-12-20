module.exports = (app, m, fn) => {
    app.get('/get/ranks', fn.loggedIn(), (req, res) => {
        m.ranks.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('ranks', res, results, req.query))
        .catch(err =>  fn.send_error(res, err));
    });
};