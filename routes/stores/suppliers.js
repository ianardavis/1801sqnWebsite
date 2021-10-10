module.exports = (app, m, fn) => {
    app.get('/suppliers',         fn.loggedIn(), fn.permissions.get('access_suppliers'),   (req, res) => res.render('stores/suppliers/index'));
    app.get('/suppliers/:id',     fn.loggedIn(), fn.permissions.get('access_suppliers'),   (req, res) => res.render('stores/suppliers/show'));

    app.get('/get/suppliers',     fn.loggedIn(), fn.permissions.check('access_suppliers'), (req, res) => {
        m.suppliers.findAll({
            where: req.query
        })
        .then(suppliers => res.send({success: true, result: suppliers}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/supplier',      fn.loggedIn(), fn.permissions.check('access_suppliers'), (req, res) => {
        fn.get(
            'suppliers',
            req.query,
            [fn.inc.stores.account()]
        )
        .then(supplier => res.send({success: true,  result: supplier}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/suppliers',        fn.loggedIn(), fn.permissions.check('supplier_add'),     (req, res) => {
        req.body.supplier = fn.nullify(req.body.supplier);
        m.suppliers.create(req.body.supplier)
        .then(supplier => res.send({success: true, message: 'Supplier added'}))
        .catch(err => res.send({success: true, message: `Error creating supplier: ${err.message}`}));
    });
    app.put('/suppliers/default', fn.loggedIn(), fn.permissions.check('supplier_edit'),    (req, res) => {
        fn.settings.set('default_supplier', req.body.supplier_id)
        .then(result => res.send({success: true, message: 'Supplier saved'}))
        .catch(err => res.send({success: true, message: `Error updating supplier: ${err.message}`}));
    });
    app.put('/suppliers/:id',     fn.loggedIn(), fn.permissions.check('supplier_edit'),    (req, res) => {
        fn.put(
            'suppliers',
            {supplier_id: req.params.id},
            req.body.supplier
        )
        .then(result => res.send({success: true, message: 'Supplier saved'}))
        .catch(err => res.send({success: true, message: `Error updating supplier: ${err.message}`}));
    });

    app.delete('/suppliers/:id',  fn.loggedIn(), fn.permissions.check('supplier_delete'),  (req, res) => {
        fn.get(
            'suppliers',
            {supplier_id: req.params.id}
        )
        .then(supplier => {
            return supplier.destroy({where: {supplier_id: req.params.id}})
            .then(result => {
                return m.settings.findOne({where: {name: 'default_supplier'}})
                .then(setting => {
                    if (!setting)           res.send({success: true, message: 'Supplier deleted'})
                    else {
                        if (Number(setting.value) === Number(req.params.id)) {
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
        })
        .catch(err => fn.send_error(res, err));
    });
};