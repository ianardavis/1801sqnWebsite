const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let utils = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/suppliers',          isLoggedIn, allowed('access_suppliers'),              (req, res) => res.render('stores/suppliers/index'));
    app.get('/stores/suppliers/new',      isLoggedIn, allowed('supplier_add'),                  (req, res) => res.render('stores/suppliers/new'));
    app.get('/stores/suppliers/:id',      isLoggedIn, allowed('access_suppliers'),              (req, res) => res.render('stores/suppliers/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/suppliers/:id/edit', isLoggedIn, allowed('supplier_edit'),                 (req, res) => res.render('stores/suppliers/edit'));

    app.post('/stores/suppliers',         isLoggedIn, allowed('supplier_add',    {send: true}), (req, res) => {
        req.body.supplier = utils.nullify(req.body.supplier);
        m.suppliers.create(req.body.supplier)
        .then(supplier => res.send({result: true, message: 'Supplier added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/suppliers/:id',      isLoggedIn, allowed('supplier_edit',   {send: true}), (req, res) => {
        if (req.body.supplier.account_id === '') {req.body.supplier.account_id = null};
        m.suppliers.update(
            req.body.supplier,
            {where: {supplier_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'Supplier saved'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/suppliers/:id',   isLoggedIn, allowed('supplier_delete', {send: true}), (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2') {
            m.suppliers.destroy({where: {supplier_id: req.params.id}})
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