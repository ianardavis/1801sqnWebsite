module.exports = (app, fn) => {
    app.get('/get/addresses', fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        fn.suppliers.addresses.get_all(req.query)
        .then(results => fn.sendRes('addresses', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/address',   fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        fn.suppliers.addresses.get(req.query.where)
        .then(address => res.send({success: true, result: address}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/addresses',    fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.create(
            req.body.supplier,
            req.body.address,
            req.body.type
        )
        .then(result => res.send({success: true, message: 'Address created'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/addresses',     fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.edit(
            req.body.address_id,
            req.body.address,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: 'Address updated'}))
        .catch(err => fn.sendError(res, err));
    });

    app.delete('/addresses',  fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.addresses.delete(req.body.address_id_delete) // "supplier_address_id" despite being called "address_id"
        .then(result => res.send({success: true, message: 'Address deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};