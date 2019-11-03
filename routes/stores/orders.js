const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/orders/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('orders_add', true, req, res, (allowed) => {
            if (req.query.user) {
                fn.getUser(req.query.user, {include: false}, req, (user) => {
                    if (user) {
                        if (req.query.user !== req.user.user_id) {
                            if (user.status.status_id !== 1) {
                                req.flash('danger', 'Orders can only be made for current users')
                                res.redirect('/stores/users/' + req.query.user);
                            } else {
                                res.render('stores/orders/new', {
                                    selectedUser: user
                                }); 
                            };
                        } else {
                            req.flash('info', 'You can not order for yourself, make a request instead!');
                            res.redirect('/stores/users/' + req.query.user);
                        };
                    } else {
                        res.redirect('/stores/users')
                    };
                });
            } else {
                req.flash('danger', 'No user specified!');
                res.redirect('/stores/users');
            };
        });
    });
    //New Logic
    app.post('/stores/orders', mw.isLoggedIn, (req, res) => {
        fn.allowed('orders_add', true, req, res, (allowed) => {
            if (req.body.selected) {
                var orders = [];
                req.body.selected.map((item) => {
                    if (item) {
                        item = JSON.parse(item);
                        var order = new cn.Order(req.body.ordered_for, item, req.user.user_id);
                        orders.push(fn.orderLine(order))
                    };
                });
                if (orders.length > 0) {
                    Promise.all(orders)
                    .then(results => {
                        fn.processPromiseResult(results, req, (then) => {
                            res.redirect('/stores/users/' + req.body.ordered_for);
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect('/stores/users/' + req.body.ordered_for);
                    });
                } else {
                    res.redirect('/stores/users/' + req.body.ordered_for);
                };
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/users');
            };
        });
    });

    //Index
    app.get('/stores/orders', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_orders', true, req, res, (allowed) => {
            var query = {};
            query.pl = Number(req.query.pl) || 1,
            query.rx = Number(req.query.rx) || 1,
            query.is = Number(req.query.is) || 2;
            query.sn = Number(req.query.sn) || 2;
            fn.getAllOrders(query, req, (orders) => {
                res.render('stores/orders/index',{
                    orders: orders,
                    query:  query
                });
            });
        });
    });

    //Show
    app.get('/stores/orders/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_orders', false, req, res, (allowed) => {
            var query = {};
            query.sn = Number(req.query.sn) || 2;
            fn.getOrder(req.params.id, req, (order) => {
                if (allowed || order.orderedFor.user_id === req.user.user_id) {
                    fn.getNotes('orders', req.params.id, req, res, (notes) => {
                        res.render('stores/orders/show',{
                            order: order,
                            notes: notes,
                            query: query
                        });
                    });
                } else {
                    req.flash('danger', 'Permission Denied!')
                    res.redirect('back');
                }; 
            });
        });
    });
};