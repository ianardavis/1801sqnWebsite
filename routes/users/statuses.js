module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/statuses', li, (req, res) => {
        m.statuses.findAll({where: req.query})
        .then(statuses => res.send({success: true,  result: statuses}))
        .catch(err =>     res.send({success: false, message: `Error getting statuses: ${err.message}`}));
    });
};