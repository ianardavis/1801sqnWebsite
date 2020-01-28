const op = require('sequelize').Op;

module.exports = (app, allowed, fn, isLoggedIn, m) => {
    //index
    app.get('/stores/demands', isLoggedIn, allowed('access_demands'), (req, res) => {
        let query = {}, where = {};
        query.cd = Number(req.query.cd) || 2;
        query.su = Number(req.query.su) || 0;
        if (query.cd === 2) where._complete = 0
        else if (query.cd === 3)  where._complete = 1;
        if (query.su !== 0) where.supplier_id = query.su;
        fn.getAllWhere(
            m.demands,
            where,
            {
                include: [
                    fn.users(),
                    m.suppliers,
                    {
                        model: m.demands_l,
                        as: 'lines'
                    }
                ],
                nullOk: false,
                attributes: null
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
    app.post('/stores/demands', isLoggedIn, allowed('demands_add'), (req, res) => {
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
                            fn.downloadFile(results.file, res);
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
    app.put('/stores/demands/:id', isLoggedIn, allowed('receipts_add'), (req, res) => {
        let actions = [],
            cancels = req.body.actions.filter(e => JSON.parse(e).action === 'cancel'),
            receipts = req.body.actions.filter(e => JSON.parse(e).action === 'receive');
        if (cancels.length > 0) actions.push(fn.cancelDemandLines(cancels));
        if (receipts.length > 0) actions.push(fn.receiveDemandLines(receipts, req.user.user_id));
        if (actions.length > 0) {
            Promise.allSettled(
                actions
            )
            .then(results => {
                results.forEach(result =>{
                    if (result.demandCLosed && result.demandClosed === true) req.flash('info', 'Demand closed')
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
        let include = [
            fn.users(),
            m.suppliers,
            {
                model: m.demands_l,
                as: 'lines',
                include: [{
                    model: m.item_sizes,
                    include: fn.itemSizes_inc({stock: true})
                }]
            }
        ];
        fn.getOne(
            m.demands,
            {demand_id: req.params.id},
            {include: include, attributes: null, nullOK: false}
        )
        .then(demand => {
            fn.getNotes('demands', req.params.id, req)
            .then(notes => {
                res.render('stores/demands/show', {
                    demand: demand,
                    query:  {sn: Number(req.query.sn) || 2},
                    notes:  notes
                });
            })
        })
        .catch(err => fn.error(err, '/stores/demands', req, res));
    });

    
    // Delete
    app.delete('/stores/demands/:id', isLoggedIn, allowed('demands_delete'), (req, res) => {
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