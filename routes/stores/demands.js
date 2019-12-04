const mw = require('../../config/middleware'),
      op = require('sequelize').Op,
      fn = require('../../db/functions'),
      cn = require('../../db/constructors');

module.exports = (app, m) => {
    //index
    app.get('/stores/demands', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_demands', true, req, res, allowed => {
            var query = {};
            query.cd = Number(req.query.cd) || 2;
            query.su = Number(req.query.su) || 0;
            var where = {};
            if (query.cd === 2) {
                where._complete = 0;
            } else if (query.cd === 3) {
                where._complete = 1;
            };
            if (query.su !== 0) where.supplier_id = query.su;
            fn.getAllWhere(
                m.demands,
                where,
                [
                    fn.users(),
                    m.suppliers,
                    {
                        model: m.demands_l,
                        as: 'lines'
                    }
                ]
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
                .catch(err => {
                    fn.error(err, '/stores', req, res);
                });
            })
            .catch(err => {
                fn.error(err, '/stores', req, res);
            });
        });
    });

    //New Logic
    app.post('/stores/demands', mw.isLoggedIn, (req, res) => {
        fn.allowed('demands_add', true, req, res, allowed => {
            var supplier_id = req.body.supplier_id;
            fn.getUndemandedOrders(
                supplier_id
            )
            .then(orders => {
                if (orders) {
                    fn.sortOrdersForDemand(
                        orders
                    )
                    .then(sortResults => {
                        if (sortResults.orders.length > 0) {
                            fn.raiseDemand(
                                supplier_id, 
                                sortResults.orders, 
                                sortResults.users
                            )
                            .then(raiseResult => {
                                fn.addDemandToOrders(
                                    supplier_id, 
                                    raiseResult, 
                                    req.user.user_id
                                )
                                .then(updateResult => {
                                    req.flash('success', 'Demand raised, orders updated');
                                    fn.downloadFile(raiseResult.file, res);
                                })
                                .catch(err => {
                                    fn.error(err, '/stores/orders', req, res);
                                });
                            })
                            .catch(err => {
                                fn.error(err, '/stores/orders', req, res);
                            });
                        } else {
                            req.flash('info', 'No orders that can be demanded');
                            res.redirect('/stores/orders');
                        };
                    })
                    .catch(err => {
                        fn.error(err, '/stores/orders', req, res);
                    });
                } else {
                    req.flash('info', 'No undemanded orders');
                    res.redirect('/stores/orders');
                };
            })
            .catch(err => {
                fn.error(err, '/stores/orders', req, res);
            });
        });
    });
    
    //download
    app.get('/stores/demands/:id/download', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_demands', true, req, res, allowed => {
            fn.getOne(
                m.demands,
                {demand_id: req.params.id}
            )
            .then(demand => {
                if (demand && demand._filename && demand._filename !== '') {
                    fn.downloadFile(demand._filename, res);
                } else {
                    req.flash('danger', 'No file found');
                    res.redirect('/stores/demands/' + req.params.id);
                };
            })
            .catch(err => {
                fn.error(err, '/stores/demands', req, res);
            });
        });
    });

    //receive
    app.put('/stores/demands/:id/action', mw.isLoggedIn, (req, res) => {
        fn.allowed('receipts_add', true, req, res, allowed => {
            var actions = [];
            if (req.body.cancels.filter(Number).length > 0) {
                actions.push(fn.cancelDemandLines(req.body.cancels.filter(Number)));
            };
            if (req.body.receives.filter(String).length > 0) {
                actions.push(fn.receiveDemandLines(req.body.receives.filter(String), req));
            };
            Promise.all(
                actions
            )
            .then(results => {
                req.flash('success', 'Lines actioned')
                res.redirect('/stores/demands/' + req.params.id);
            })
            .catch(err => {
                fn.error(err, '/stores/demands', req, res);
            });
        });
    });
    
    //Show
    app.get('/stores/demands/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_demands', true, req, res, allowed => {
            var query = {};
            query.sn = Number(req.query.sn) || 2;
            var include = [
                fn.users(),
                m.suppliers,
                {
                    model: m.demands_l,
                    as: 'lines',
                    include: [
                        fn.item_sizes(true, true, false)
                    ]
                }
            ];
            fn.getOne(
                m.demands,
                {demand_id: req.params.id},
                include
            )
            .then(demand => {
                fn.getNotes('demands', req.params.id, req, res)
                .then(notes => {
                    res.render('stores/demands/show', {
                        demand: demand,
                        query:  query,
                        notes:  notes
                    });
                })
            })
            .catch(err => {
                fn.error(err, '/stores/demands', req, res);
            });
        });
    });
};