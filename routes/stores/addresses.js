module.exports = (app, fn) => {
    app.get('/get/addresses',    fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        fn.suppliers.addresses.get_all(req.query)
        .then(results => fn.send_res('addresses', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/address',      fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        fn.suppliers.addresses.get(req.query.where)
        .then(address => res.send({success: true, result: address}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/addresses',       fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.create(
            req.body.supplier,
            req.body.address,
            req.body.type
        )
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