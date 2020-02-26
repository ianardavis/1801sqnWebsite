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
        fn.getUndemandedOrders(supplier_id)
        .then(orders => {
            fn.sortOrdersForDemand(orders)
            .then(sortResults => {
                if (sortResults.orders.length > 0) {
                    fn.raiseDemand(
                        supplier_id, 
                        sortResults.orders, 
                        sortResults.users
                    )
                    .then(results => {
                        fn.createDemand(
                            supplier_id,
                            results.items.success,
                            req.user.user_id,
                            results.file
                        )
                        .then(demand_id => {
                            req.flash('success', 'Demand raised, ID: ' + demand_id + ', orders updated');
                            res.redirect('/stores/orders?download=' + results.file);
                        })
                        .catch(err => fn.error(err, '/stores/orders', req, res));
                    })
                    .catch(err => fn.error(err, '/stores/orders', req, res));
                } else {
                    req.flash('info', 'No orders that can be demanded');
                    res.redirect('/stores/orders');
                };
            })
            .catch(err => fn.error(err, '/stores/orders', req, res));
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
        let actions = [], cancels = [], receipts = [];
        for (let [demand_line_id, line] of Object.entries(req.body.actions)) {
            if (line.action === 'cancel') cancels.push(demand_line_id)
            else if (line.action !== 'cancel' && line.action !== 'null') {
                receipts.push({
                    line_id:  demand_line_id,
                    qty:      line.qty,
                    stock_id: line.action
                })
            };
        };
        if (cancels.length > 0)  actions.push(fn.cancelDemandLines(cancels));
        if (receipts.length > 0) actions.push(fn.receiveDemandLines(receipts, req.user.user_id));
        if (actions.length > 0) {
            Promise.allSettled(actions)
            .then(results => {
                results.forEach(result => {
                    if (result.demandClosed && result.demandClosed === true) req.flash('info', 'Demand closed')
                });
                req.flash('success', 'Lines actioned')
                res.redirect('/stores/demands/' + req.params.id);
            })
            .catch(err => fn.error(err, '/stores/demands', req, res));
        } else {
            req.flash('info', 'No lines to action')
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
                    inc.sizes({stock: true}),
                ]}),
            ]}
        )
        .then(demand => {
            fn.getNotes('demands', req.params.id, req)
            .then(notes => {
                res.render('stores/demands/show', {
                    demand: demand,
                    query:  {system: Number(req.query.system) || 2, received: Number(req.query.received) || 2},
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