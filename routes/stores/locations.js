module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/locations', li, pm.check('access_locations', {send: true}), (req, res) => {
        m.locations.findAll({where: req.query})
        .then(locations => res.send({success: true, result: locations}))
        .catch(err => send_error(res, err));
    });
};