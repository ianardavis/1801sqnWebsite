module.exports = (app, m, fn) => {
    app.get('/get/addresses',    fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        m.addresses.findAndCountAll({
            include: [{
                model: m.supplier_addresses,
                where: req.query.where
            }],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('addresses', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/address',      fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        m.supplier_addresses.findOne({
            where: req.query.where,
            include: [fn.inc.stores.address()]
        })
        .then(address => {
            if (address) {
                res.send({success: true, result: address});
            } else {
                res.send({success: false, message: 'Address not found'});
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/addresses',       fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.create(req.body.supplier, req.body.address, req.body.type)
        .then(result => res.send({success: true, message: 'Address created'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/addresses',        fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.edit(
            req.body.address_id,
            req.body.address,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: 'Address updated'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/addresses/:id', fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Address deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};