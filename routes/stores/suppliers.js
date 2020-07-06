const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/suppliers',          isLoggedIn, allowed('access_suppliers'),            (req, res) => res.render('stores/suppliers/index'));
    app.get('/stores/suppliers/new',      isLoggedIn, allowed('supplier_add'),                (req, res) => res.render('stores/suppliers/new'));
    app.get('/stores/suppliers/:id',      isLoggedIn, allowed('access_suppliers'),            (req, res) => res.render('stores/suppliers/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/suppliers/:id/edit', isLoggedIn, allowed('supplier_edit'),               (req, res) => res.render('stores/suppliers/edit'));

    app.post('/stores/suppliers',         isLoggedIn, allowed('supplier_add',  {send: true}), (req, res) => {
        req.body.supplier = db.nullify(req.body.supplier);
        m.suppliers.create(req.body.supplier)
        .then(supplier => res.send({result: true, message: 'Supplier added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/suppliers/:id',      isLoggedIn, allowed('supplier_edit', {send: true}), (req, res) => {
        if (req.body.supplier.account_id === '') {req.body.supplier.account_id = null};
        db.update({
            table: m.suppliers,
            where: {supplier_id: req.params.id},
            record: req.body.supplier
        })
        .then(result => res.send({result: true, message: 'Supplier saved'}))
        .catch(err => res.error.send(err, res));
    });
};