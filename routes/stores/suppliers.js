const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        settings = require(process.env.ROOT + '/fn/settings');
    app.get('/stores/suppliers',             isLoggedIn, allowed('access_suppliers'),               (req, res) => {
        settings.get({
            m: {settings: m.settings},
            name: 'default supplier',
            default: -1
        })
        .then(defaultSupplier => res.render('stores/suppliers/index', {_default: defaultSupplier}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/suppliers/new',         isLoggedIn, allowed('supplier_add'), (req, res) => res.render('stores/suppliers/new'));
    app.get('/stores/suppliers/:id',         isLoggedIn, allowed('access_suppliers'),               (req, res) => {
        db.findOne({
            table: m.suppliers,
            where: {supplier_id: req.params.id},
            include: [
                m.files,
                m.accounts
        ]})
        .then(supplier => {
            settings.get({
                m: {settings: m.settings},
                name: 'default supplier',
                default: -1
            })
            .then(defaultSupplier => {
                res.render('stores/suppliers/show', {
                    _default: defaultSupplier,
                    supplier: supplier,
                    show_tab: req.query.tab || 'details'
                });
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/suppliers/:id/edit',    isLoggedIn, allowed('supplier_edit'),                  (req, res) => {
        settings.get({
            m: {settings: m.settings},
            name: 'default supplier',
            default: -1
        })
        .then(defaultSupplier => {
            m.accounts.findAll()
            .then(accounts => {
                db.findOne({
                    table: m.suppliers,
                    where: {supplier_id: req.params.id}
                })
                .then(supplier => res.render('stores/suppliers/edit', {
                    supplier: supplier,
                    _default: defaultSupplier,
                    accounts: accounts
                }))
                .catch(err => res.error.redirect(err, req, res));
            })
            .catch(err => res.error.redirect(err, req, res));
        });
    });
    
    app.get('/stores/get/suppliers',         isLoggedIn, allowed('access_suppliers', {send: true}), (req, res) => {
        m.suppliers.findAll({include: [m.sizes]})
        .then(suppliers => res.send({result: true, suppliers: suppliers}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/suppliers',            isLoggedIn, allowed('supplier_add',     {send: true}), (req, res) => {
        if (!req.body.supplier._stores) {req.body.supplier._stores = 0};
        m.suppliers.create(req.body.supplier)
        .then(supplier => {
            if (req.body.default && req.body.default === '1') setDefault(supplier.supplier_id, res)
            else res.send({result: true, message: 'Supplier added'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/suppliers/:id/default', isLoggedIn, allowed('supplier_edit',    {send: true}), (req, res) => {
        db.findOne({
            table: m.suppliers,
            where: {supplier_id: req.params.id}
        })
        .then(supplier => {
            settings.edit({
                m: {settings: m.settings},
                name: 'default supplier',
                value: supplier.supplier_id
            })
            .then(result => {
                if (result) res.send({result: true, message: 'Default supplier updated'})
                else  res.send({result: false, message: 'Default supplier NOT updated'});
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/suppliers/:id',         isLoggedIn, allowed('supplier_edit',    {send: true}), (req, res) => {
        if (req.body.supplier.account_id === '') {req.body.supplier.account_id = null};
        db.update({
            table: m.suppliers,
            where: {supplier_id: req.params.id},
            record: req.body.supplier
        })
        .then(result => res.send({result: true, message: 'Supplier saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/suppliers/:id',      isLoggedIn, allowed('supplier_delete',  {send: true}), (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2') {
            db.destroy({
                table: m.suppliers,
                where: {supplier_id: req.params.id}
            })
            .then(result => {
                settings.get({
                    m: {settings: m.settings},
                    name: 'default supplier',
                    default: -1
                })
                .then(defaultSupplier => {
                    if (Number(defaultSupplier) === Number(req.params.id)) {
                        setDefault('', res);
                    } else res.send({result: true, message: 'Supplier deleted'});
                })
                .catch(err => res.error.send(err,message, res));
            })
            .catch(err => res.error.send(err,message, res));
        } else res.error.send('This supplier can not be deleted!', res);
    });

    setDefault = (supplier_id, res) => {
        settings.edit({
            m: {settings: m.settings},
            name: 'default supplier',
            value: supplier_id
        })
        .then(result => {
            if (result) res.send({result: true, message: 'Default supplier updated'})
            else res.send({result: true, message: 'Default supplier NOT updated'});
        })
        .catch(err => res.error.send(err,message, res));
    };
};