module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/locations', pm.check('access_locations', {send: true}), (req, res) => {
        m.locations.findAll({where: req.query})
        .then(locations => res.send({success: true, result: locations}))
        .catch(err => res.error.send(err, res));
    });
};