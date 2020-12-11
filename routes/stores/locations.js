module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/stores/get/locations', permissions, allowed('access_locations', {send: true}), (req, res) => {
        m.locations.findAll({where: req.query})
        .then(locations => res.send({result: true, locations: locations}))
        .catch(err => res.error.send(err, res));
    });
};