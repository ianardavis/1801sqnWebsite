module.exports = (app, m, pm, op, inc, send_error) => {
    let nullify = require(`../functions/nullify`);
    app.get('/suppliers',        pm.get, pm.check('access_suppliers'),     (req, res) => res.render('stores/suppliers/index'));
    app.get('/suppliers/:id',    pm.get, pm.check('access_suppliers'),     (req, res) => res.render('stores/suppliers/show'));

    app.get('/get/suppliers',    pm.check('access_suppliers', {send: true}), (req, res) => {
        m.suppliers.findAll({
            where:      req.query,
            include:    [inc.accounts()]
        })
        .then(suppliers => res.send({success: true, result: suppliers}))
        .catch(err => res.send({success: false, message: `Error getting suppliers: ${err.message}`}));
    });
    app.get('/get/supplier',     pm.check('access_suppliers', {send: true}), (req, res) => {
        m.suppliers.findOne({
            where:      req.query,
            include:    [inc.accounts()]
        })
        .then(supplier => {
            if (!supplier) res.send({success: false, message: 'Supplier not found'})
            else           res.send({success: true,  result: supplier})})
        .catch(err => res.send({success: false, message: `Error getting supplier: ${err.message}`}));
    });

    app.post('/suppliers',       pm.check('supplier_add',     {send: true}), (req, res) => {
        req.body.supplier = nullify(req.body.supplier);
        m.suppliers.create(req.body.supplier)
        .then(supplier => res.send({success: true, message: 'Supplier added'}))
        .catch(err => res.send({success: true, message: `Error creating supplier: ${err.message}`}));
    });
    app.put('/suppliers/:id',    pm.check('supplier_edit',    {send: true}), (req, res) => {
        if (req.body.supplier.account_id === '') {req.body.supplier.account_id = null};
        m.suppliers.update(
            req.body.supplier,
            {where: {supplier_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Supplier saved'}))
        .catch(err => res.send({success: true, message: `Error updating supplier: ${err.message}`}));
    });

    app.delete('/suppliers/:id', pm.check('supplier_delete',  {send: true}), (req, res) => {
        m.suppliers.findOne({
            where: {supplier_id: req.params.id},
            attributes: ['supplier_id']
        })
        .then(supplier => {
            if      (!supplier)                  res.send({success: false, message: 'Supplier not found'})
            else if (supplier.supplier_id === 1) res.send({success: false, message: 'This supplier can not be deleted!'})
            else if (supplier.supplier_id === 2) res.send({success: false, message: 'This supplier can not be deleted!'})
            else {
                supplier.destroy({where: {supplier_id: req.params.id}})
                .then(result => {
                    m.settings.findOne({
                        where: {_name: 'default_supplier'},
                        attributes: ['setting_id', '_value']
                    })
                    .then(setting => {
                        if (!setting)           res.send({success: true, message: 'Supplier deleted'})
                        else {
                            if (Number(setting._value) === Number(req.params.id)) {
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
                .catch(err => res.send({success: false, message: `Error deleting supplier: ${err.message}`}));
            };
        })
        .catch(err => res.send({success: false, message: `Error getting supplier: ${err.message}`}));
    });
};