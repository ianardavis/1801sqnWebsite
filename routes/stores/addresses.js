module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/addresses',    li, pm.check('access_supplier_addresses', {send: true}), (req, res) => {
        m.supplier_addresses.findAll({
            where: req.query,
            include: [inc.address()]
        })
        .then(addresses => res.send({success: true, result: addresses}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/address',      li, pm.check('access_supplier_addresses', {send: true}), (req, res) => {
        m.supplier_addresses.findOne({
            where: req.query,
            include: [inc.address()]
        })
        .then(address => res.send({success: true, result: address}))
        .catch(err => send_error(res, err));
    });

    app.post('/addresses',       li, pm.check('supplier_address_add',      {send: true}), (req, res) => {
        m.suppliers.findOne({where: {supplier_id: req.body.supplier_id}})
        .then(supplier => {
            if (!supplier) send_error(res, 'Supplier not found')
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
    app.put('/addresses',        li, pm.check('supplier_address_add',      {send: true}), (req, res) => {
        m.supplier_addresses.findOne({
            where: {supplier_address_id: req.body.supplier_address_id},
            include: [inc.address()]
        })
        .then(address => {
            if      (!address)         send_error(res, 'Address not found')
            else if (!address.address) send_error(res, 'No address for this record')
            else {
                return address.address.update(req.body.address)
                .then(result => {
                    if (!result) send_error(res, 'Address not updated')
                    else res.send({success: true, message: 'Address updated'});
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
    app.delete('/addresses/:id', li, pm.check('supplier_address_delete',   {send: true}), (req, res) => {
        m.supplier_addresses.findOne({
            where: {supplier_address_id: req.params.id},
            include: [inc.address()]
        })
        .then(address => {
            if (!address) send_error(res, 'Address not found')
            else {
                let actions = [];
                if (address.address) actions.push(address.address.destroy());
                actions.push(address.destroy())
                return Promise.all(actions)
                .then(result => res.send({success: true, message: 'Address deleted'}))
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};