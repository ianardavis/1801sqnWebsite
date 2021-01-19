module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/stores/get/locations', permissions, allowed('access_locations', {send: true}), (req, res) => {
        m.stores.locations.findAll({where: req.query})
        .then(locations => res.send({success: true, result: locations}))
        .catch(err => res.error.send(err, res));
    });
};