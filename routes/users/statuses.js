module.exports = (app, m, fn) => {
    app.get('/get/statuses', fn.loggedIn(), (req, res) => {
        m.statuses.findAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(statuses => res.send({success: true,  result: statuses}))
        .catch(err =>     fn.send_error(res, err));
    });
};