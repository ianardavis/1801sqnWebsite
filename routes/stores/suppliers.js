module.exports = (app, m, fn) => {
    app.get('/suppliers',             fn.loggedIn(), fn.permissions.get('supplier_admin'),   (req, res) => res.render('stores/suppliers/index'));
    app.get('/suppliers/:id',         fn.loggedIn(), fn.permissions.get('supplier_admin'),   (req, res) => res.render('stores/suppliers/show'));

    app.get('/get/suppliers',         fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        let where = req.query.where || {};
        if (req.query.like && req.query.like.name) {
            where.name = {[fn.op.substring]: req.query.like.name}
        }
        m.suppliers.findAndCountAll({
            where: where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('suppliers', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/supplier',          fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        m.suppliers.findOne({
            where: req.query.where,
            include: [fn.inc.stores.account()]
        })
        .then(supplier => {
            if (supplier) res.send({success: true,  result: supplier})
            else res.send({success: false, message: 'Supplier not found'});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/suppliers',            fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        req.body.supplier = fn.nullify(req.body.supplier);
        m.suppliers.create(req.body.supplier)
        .then(supplier => res.send({success: true, message: 'Supplier added'}))
        .catch(err => res.send({success: true, message: `Error creating supplier: ${err.message}`}));
    });
    app.put('/suppliers/:id/default', fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.settings.set('default_supplier', req.params.id)
        .then(result => res.send({success: true, message: 'Supplier saved'}))
        .catch(err => res.send({success: true, message: `Error updating supplier: ${err.message}`}));
    });
    app.put('/suppliers/:id',         fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.edit(req.params.id, req.body.supplier)
        .then(result => res.send({success: true, message: 'Supplier saved'}))
        .catch(err => res.send({success: true, message: `Error updating supplier: ${err.message}`}));
    });

    app.delete('/suppliers/:id',      fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.get(req.params.id)
        .then(supplier => {
            supplier.destroy({where: {supplier_id: req.params.id}})
            .then(result => {
                m.settings.findOne({where: {name: 'default_supplier'}})
                .then(setting => {
                    if (!setting)           res.send({success: true, message: 'Supplier deleted'})
                    else {
                        if (Number(setting.value) === Number(req.params.id)) {
                            setting.destroy()
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