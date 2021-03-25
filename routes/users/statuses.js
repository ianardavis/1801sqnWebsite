module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/statuses', (req, res) => {
        m.statuses.findAll({where: req.query})
        .then(statuses => res.send({success: true,  result: statuses}))
        .catch(err =>     res.send({success: false, message: `Error getting statuses: ${err.message}`}));
    });
};