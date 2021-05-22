module.exports = (app, m, inc, fn) => {
    app.get('/get/statuses', fn.li(), (req, res) => {
        m.statuses.findAll({where: req.query})
        .then(statuses => res.send({success: true,  result: statuses}))
        .catch(err =>     fn.send_error(res, err));
    });
};