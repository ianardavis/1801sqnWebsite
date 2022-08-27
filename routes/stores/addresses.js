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
            if (address) res.send({success: true, result: address})
            else res.send({success: false, message: 'Address not found'});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/addresses',       fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.get(req.body.supplier_id)
        .then(supplier => {
            m.addresses.findOrCreate({
                where:    req.body.address,
                defaults: {type: req.body.type}
            })
            .then(([address, created]) => {
                m.supplier_addresses.create({
                    supplier_id: supplier.supplier_id,
                    address_id: address.address_id
                })
                .then(supplier_address => res.send({success: true, message: 'Address created'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/addresses',        fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.get(req.body.supplier_address_id)
        .then(address => {
            if (!address.address) fn.send_error(res, 'No address for this record')
            else {
                fn.update(address.address, req.body.address)
                .then(result => res.send({success: true, message: 'Address updated'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/addresses/:id', fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.get(req.params.id)
        .then(address => {
            let actions = [];
            if (address.address) actions.push(address.address.destroy());
            actions.push(address.destroy())
            Promise.all(actions)
            .then(result => res.send({success: true, message: 'Address deleted'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};