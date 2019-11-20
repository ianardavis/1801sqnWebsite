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
            fn.getAllDemands(query, req, demands => {
                fn.getAllSuppliers(req, suppliers => {
                    res.render('stores/demands/index', {
                        suppliers: suppliers,
                        demands:   demands,
                        query:     query
                    });
                });
            });
        });
    });

    //New Logic
    app.post('/stores/demands', mw.isLoggedIn, (req, res) => {
        fn.allowed('demands_add', true, req, res, allowed => {
            fn.getUndemandedOrders(
                req.body.supplier_id
            )
            .then(orders => {
                if (orders) {
                    fn.sortOrdersForDemand(
                        orders
                    )
                    .then(sortResults => {
                        if (sortResults.orders) {
                            fn.createDemandFile(
                                req.body.supplier_id
                            )
                            .then(file => {
                                fn.writeItems(
                                    file, 
                                    sortResults.orders
                                )
                                .then(writeItemResults => {
                                    if (writeItemResults.fails.length > 0) req.flash('danger', 'Error writing some lines to file')
                                    if (writeItemResults.success) {
                                        fn.writeCoverSheet(file, req.body.supplier_id, sortResults.users)
                                        .then(coverSheetResults => {
                                            req.flash('success', 'demand created')
                                            res.redirect('/stores/demands');
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            req.flash('danger', err.message)
                                            res.redirect('/stores/demands');
                                        });
                                    } else {
                                        req.flash('danger', 'No items written to demand');
                                        res.redirect('/stores/demands');
                                    };
                                })
                                .catch(err => {
                                    console.log(err);
                                    req.flash('danger', err.message)
                                    res.redirect('/stores/demands');
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                req.flash('danger', err.message)
                                res.redirect('/stores/demands');
                            });
                        } else {
                            req.flash('info', 'No orders that can be demanded');
                            res.redirect('/stores/demands');
                        };
                    })
                    .catch(err => {
                        console.log(err);
                        req.flash('danger', err.message);
                        res.redirect('/stores/demands');
                    });
                } else {
                    req.flash('info', 'No undemanded orders');
                    res.redirect('/stores/demands');
                };
            })
            .catch(err => {
                console.log(err);
                req.flash('danger', err.message);
                res.redirect('/stores/demands');
            });
        });
    });
};