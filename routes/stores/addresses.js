module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/addresses', li, pm.check('access_supplier_addresses', {send: true}), (req, res) => {
        m.supplier_addresses.findAll({
            where: req.query,
            include: [inc.address()]
        })
        .then(addresses => res.send({success: true, result: addresses}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/address',   li, pm.check('access_supplier_addresses', {send: true}), (req, res) => {
        m.supplier_addresses.findOne({
            where: req.query,
            include: [inc.address()]
        })
        .then(address => res.send({success: true, result: address}))
        .catch(err => send_error(res, err));
    });
    app.post('/addresses',    li, pm.check('supplier_address_add',    {send: true}), (req, res) => {
        m.suppliers.findOne({where: {supplier_id: req.body.supplier_id}})
        .then(supplier => {
            if (!supplier) send_error(res, 'SUpplier not found')
            else {
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
                    .catch(err => send_error(res, err));
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};