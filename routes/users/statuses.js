module.exports = (app, m, fn) => {
    app.get('/get/statuses', fn.loggedIn(), (req, res) => {
        m.statuses.findAll({
            where: JSON.parse(req.query.where),
            ...fn.sort(req.query.sort)
        })
        .then(statuses => res.send({success: true,  result: statuses}))
        .catch(err =>     fn.send_error(res, err));
    });
};