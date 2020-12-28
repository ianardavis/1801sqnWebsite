const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let nullify = require(`${process.env.ROOT}/fn/utils/nullify`);
    app.get('/stores/suppliers',          permissions, allowed('access_suppliers'),               (req, res) => res.render('stores/suppliers/index'));
    app.get('/stores/suppliers/new',      permissions, allowed('supplier_add'),                   (req, res) => res.render('stores/suppliers/new'));
    app.get('/stores/suppliers/:id',      permissions, allowed('access_suppliers'),               (req, res) => res.render('stores/suppliers/show'));
    app.get('/stores/suppliers/:id/edit', permissions, allowed('supplier_edit'),                  (req, res) => res.render('stores/suppliers/edit'));

    app.get('/stores/get/suppliers',      permissions, allowed('access_suppliers', {send: true}), (req, res) => {
        m.stores.suppliers.findAll({
            where:      req.query,
            include:    [inc.accounts(), inc.files()]
        })
        .then(suppliers => res.send({result: true, suppliers: suppliers}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/suppliers',         permissions, allowed('supplier_add',     {send: true}), (req, res) => {
        req.body.supplier = nullify(req.body.supplier);
        m.stores.suppliers.create(req.body.supplier)
        .then(supplier => res.send({result: true, message: 'Supplier added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/suppliers/:id',      permissions, allowed('supplier_edit',    {send: true}), (req, res) => {
        if (req.body.supplier.account_id === '') {req.body.supplier.account_id = null};
        m.stores.suppliers.update(
            req.body.supplier,
            {where: {supplier_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'Supplier saved'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/suppliers/:id',   permissions, allowed('supplier_delete',  {send: true}), (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2') {
            m.stores.suppliers.destroy({where: {supplier_id: req.params.id}})
            .then(result => {
                settings.get({
                    name: 'default_supplier',
                    default: -1
                })
                .then(defaultSupplier => {
                    if (Number(defaultSupplier) === Number(req.params.id)) {
                        settings.edit({
                            name: 'default_supplier',
                            value: -1
                        })
                        .then(result => {
                            if (result) res.send({result: true, message: 'Default supplier deleted, settings updated'})
                            else res.send({result: false, message: 'Default supplier deleted, settings NOT updated'});
                        })
                        .catch(err => res.error.send(err.message, res));
                    } else res.send({result: true, message: 'Supplier deleted'});
                })
                .catch(err => res.error.send(err.message, res));
            })
            .catch(err => res.error.send(err.message, res));
        } else res.error.send('This supplier can not be deleted!', res);
    });
};