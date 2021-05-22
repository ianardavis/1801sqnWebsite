module.exports = (app, m, inc, fn) => {
    app.get('/suppliers',        fn.li(), fn.permissions.get('access_suppliers'),   (req, res) => res.render('stores/suppliers/index'));
    app.get('/suppliers/:id',    fn.li(), fn.permissions.get('access_suppliers'),   (req, res) => res.render('stores/suppliers/show'));

    app.get('/get/suppliers',    fn.li(), fn.permissions.check('access_suppliers'), (req, res) => {
        m.suppliers.findAll({
            where: req.query
            // include: [inc.accounts()]
        })
        .then(suppliers => res.send({success: true, result: suppliers}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/supplier',     fn.li(), fn.permissions.check('access_suppliers'), (req, res) => {
        m.suppliers.findOne({
            where:      req.query,
            include:    [inc.accounts()]
        })
        .then(supplier => {
            if (!supplier) fn.send_error(res, 'Supplier not found')
            else           res.send({success: true,  result: supplier})})
        .catch(err => fn.send_error(res, err));
    });

    app.post('/suppliers',       fn.li(), fn.permissions.check('supplier_add'),     (req, res) => {
        req.body.supplier = fn.nullify(req.body.supplier);
        m.suppliers.create(req.body.supplier)
        .then(supplier => res.send({success: true, message: 'Supplier added'}))
        .catch(err => res.send({success: true, message: `Error creating supplier: ${err.message}`}));
    });
    app.put('/suppliers/:id',    fn.li(), fn.permissions.check('supplier_edit'),    (req, res) => {
        if (req.body.supplier.account_id === '') {req.body.supplier.account_id = null};
        m.suppliers.update(
            req.body.supplier,
            {where: {supplier_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Supplier saved'}))
        .catch(err => res.send({success: true, message: `Error updating supplier: ${err.message}`}));
    });

    app.delete('/suppliers/:id', fn.li(), fn.permissions.check('supplier_delete'),  (req, res) => {
        m.suppliers.findOne({
            where: {supplier_id: req.params.id},
            attributes: ['supplier_id']
        })
        .then(supplier => {
            if (!supplier) fn.send_error(res, 'Supplier not found')
            else {
                return supplier.destroy({where: {supplier_id: req.params.id}})
                .then(result => {
                    return m.settings.findOne({
                        where: {name: 'default_supplier'},
                        attributes: ['setting_id', 'value']
                    })
                    .then(setting => {
                        if (!setting)           res.send({success: true, message: 'Supplier deleted'})
                        else {
                            if (Number(setting._value) === Number(req.params.id)) {
                                return setting.destroy()
                                .then(result => {
                                    if (result) res.send({success: true, message: 'Default supplier deleted, settings updated'})
                                    else        res.send({success: true, message: 'Default supplier deleted, settings NOT updated'});
                                })
                                .catch(err =>   res.send({success: true, message: `Error deleting setting: ${err.message}`}));
                            } else              res.send({success: true, message: 'Supplier deleted'});
                        };
                    })
                    .catch(err => res.send({success: true, message: `Error getting settings: ${err.message}`}));
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};