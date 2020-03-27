const op = require('sequelize').Op;

module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //index
    app.get('/stores/demands', isLoggedIn, allowed('access_demands'), (req, res) => {
        let query = {}, where = {};
        query.complete    = Number(req.query.complete)    || 2;
        query.supplier_id = Number(req.query.supplier_id) || 0;
        if (query.complete === 2)      where._complete   = 0
        else if (query.complete === 3) where._complete   = 1;
        if (query.supplier_id !== 0)   where.supplier_id = query.supplier_id;
        fn.getAllWhere(
            m.demands,
            where,
            {
                include: [
                    inc.users(),
                    inc.demand_lines(),
                    m.suppliers
                ]
            }
        )
        .then(demands => {
            fn.getAllWhere(
                m.suppliers,
                {supplier_id: {[op.not]: 3}}
            )
            .then(suppliers => {
                res.render('stores/demands/index', {
                    suppliers: suppliers,
                    demands:   demands,
                    query:     query
                });
            })
            .catch(err => fn.error(err, '/stores', req, res));
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });

    //New Logic
    app.post('/stores/demands', isLoggedIn, allowed('demand_add'), (req, res) => {
        let supplier_id = req.body.supplier_id;
        fn.getOne(
            m.suppliers,
            {supplier_id: supplier_id},
            {include: [
                m.files, 
                {model: m.accounts, include: [inc.users()]}
            ]}
        )
        .then(supplier => {
            if (supplier._raise_demand) {
                fn.getAllWhere(
                    m.order_lines,
                    {demand_line_id: null},
                    {include: [
                        inc.sizes({include: [
                            inc.suppliers({
                                where: {supplier_id: req.body.supplier_id},
                                required: true
                            })
                        ]}),
                        inc.orders({include: [
                            inc.users({as: '_for'})
                        ]})   
                    ]}
                )
                .then(orders => {
                    fn.raiseDemand(orders, supplier_id, req.user.user_id)
                    .then(results => {
                        req.flash('success', 'Demand raised, ID: ' + results.demand_id + ', orders updated');
                        res.redirect('/stores/orders?download=' + results.file);
                    })
                    .catch(err => fn.error(err, '/stores/orders', req, res));
                })
                .catch(err => fn.error(err, '/stores/orders', req, res));
            } else {
                
            };
        })
        .catch(err => fn.error(err, '/stores/orders', req, res));
    });
    
    //download
    app.get('/stores/demands/:id/download', isLoggedIn, allowed('access_demands'), (req, res) => {
        fn.getOne(
            m.demands,
            {demand_id: req.params.id}
        )
        .then(demand => {
            if (demand && demand._filename && demand._filename !== '') fn.downloadFile(demand._filename, res);
            else {
                req.flash('danger', 'No file found');
                res.redirect('/stores/demands/' + req.params.id);
            };
        })
        .catch(err => fn.error(err, '/stores/demands', req, res));
    });

    //action
    app.put('/stores/demands/:id', isLoggedIn, allowed('receipt_add'), (req, res) => {
        if (req.body.selected) {
            if (req.body.action === 'receive') {
                fn.receive_demand_lines(req.body.selected)
                .then(results => {
                    if (results.noStocks) req.flash('danger', 'Some items have no stock records');
                    res.render('stores/receipts/new', results);
                })
                .catch(err => fn.error(err, '/stores/demands/' + req.params.id, req, res));
            } else if (req.body.action === 'cancel') {
                fn.cancel_demand_lines(req.body.selected, req.params.id, req.user.user_id)
                .then(result => {
                    req.flash('success', 'Lines cancelled');
                    res.redirect('/stores/demands/' + req.params.id);
                })
                .catch(err => fn.error(err, '/stores/demands/' + req.params.id,req, res));
            } else {
                req.flash('danger', 'Invalid request');
                res.redirect('/stores/demands/' + req.params.id);
            };
        } else {
            req.flash('info', 'No lines selected');
            res.redirect('/stores/demands/' + req.params.id);
        };
    });
    
    //Show
    app.get('/stores/demands/:id', isLoggedIn, allowed('access_demands'), (req, res) => {
        fn.getOne(
            m.demands,
            {demand_id: req.params.id},
            {include: [
                inc.users(),
                m.suppliers,
                inc.demand_lines({sizes: true, include: [
                    inc.sizes({stock: true})
                ]}),
            ]}
        )
        .then(demand => {
            fn.getNotes('demands', req.params.id, req)
            .then(notes => {
                res.render('stores/demands/show', {
                    demand: demand,
                    query:  {system: Number(req.query.system) || 2},
                    notes:  notes
                });
            })
        })
        .catch(err => fn.error(err, '/stores/demands', req, res));
    });

    
    // Delete
    app.delete('/stores/demands/:id', isLoggedIn, allowed('demand_delete'), (req, res) => {
        fn.delete(
            'demands',
            {demand_id: req.params.id},
            {hasLines: true}
        )
        .then(result => {
            req.flash(result.success, result.message);
            res.redirect('/stores/demands');
        })
        .catch(err => fn.error(err, '/stores/demands', req, res));
    });
};