module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/get/locations', pm, al('access_locations', {send: true}), (req, res) => {
        m.stores.locations.findAll({where: req.query})
        .then(locations => res.send({success: true, result: locations}))
        .catch(err => res.error.send(err, res));
    });
};