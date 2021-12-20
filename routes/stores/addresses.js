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
        fn.get(
            'supplier_addresses',
            req.query.where,
           [fn.inc.stores.address()]
        )
        .then(address => res.send({success: true, result: address}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/addresses',       fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.get(
            'suppliers',
            {supplier_id: req.body.supplier_id}
        )
        .then(supplier => {
            return m.addresses.findOrCreate({
                where:    req.body.address,
                defaults: {type: req.body.type}
            })
            .then(([address, created]) => {
                return m.supplier_addresses.create({
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
        fn.get(
            'supplier_addresses',
            {supplier_address_id: req.body.supplier_address_id},
            [fn.inc.stores.address()]
        )
        .then(address => {
            if (!address.address) fn.send_error(res, 'No address for this record')
            else {
                return fn.update(address.address, req.body.address)
                .then(result => res.send({success: true, message: 'Address updated'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/addresses/:id', fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.get(
            'supplier_addresses',
            {supplier_address_id: req.params.id},
            [fn.inc.stores.address()]
        )
        .then(address => {
            let actions = [];
            if (address.address) actions.push(address.address.destroy());
            actions.push(address.destroy())
            return Promise.all(actions)
            .then(result => res.send({success: true, message: 'Address deleted'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};