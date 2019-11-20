const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/orders/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('orders_add', true, req, res, allowed => {
            if (req.query.user) {
                if (req.query.user !== -1) {
                    fn.getUser(req.query.user, {include: false}, req, user => {
                        if (user) {
                            if (req.query.user !== req.user.user_id) {
                                if (user.status_id !== 1) {
                                    req.flash('danger', 'Orders can only be made for current users')
                                    res.redirect('/stores/users/' + req.query.user);
                                } else {
                                    res.render('stores/orders/new', {
                                        user: user
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
                    res.render('stores/orders/new', {
                        user: {user_id: -1}
                    });
                }
            } else {
                req.flash('danger', 'No user specified!');
                res.redirect('/stores/users');
            };
        });
    });
    //New Logic
    app.post('/stores/orders', mw.isLoggedIn, (req, res) => {
        fn.allowed('orders_add', true, req, res, allowed => {
            if (req.body.selected) {
                var newOrder = new cn.Order(req.body.ordered_for, req.user.user_id);
                fn.create(m.orders, newOrder, req, order => {
                    var orders = [];
                    req.body.selected.map(item => {
                        if (item) {
                            var line = new cn.OrderLine(order.order_id, JSON.parse(item));
                            orders.push(fn.orderLine(line));
                        };
                    });
                    if (orders.length > 0) {
                        Promise.all(orders)
                        .then(results => {
                            fn.processPromiseResult(results, req, then => {
                                res.redirect('/stores/users/' + req.body.ordered_for);
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.redirect('/stores/users/' + req.body.ordered_for);
                        });
                    } else {
                        fn.delete(m.orders, {order_id: order.order_id}, req, next => {
                            res.redirect('/stores/users/' + req.body.ordered_for);
                        });
                    };
                });
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/users');
            };
        });
    });

    //delete
    app.delete('/stores/orders/:id', mw.isLoggedIn, (req, res) => {
        if (req.query.user) {
            fn.allowed('orders_delete', true, req, res, (allowed) => {
                fn.delete(m.orders_l, {order_id: req.params.id}, req, (line_result) => {
                    if (!line_result) req.flash('danger', 'No lines deleted');
                    fn.delete(m.orders, {order_id: req.params.id}, req, (order_result) => {
                        if (!order_result) req.flash('danger', 'Error deleting order');
                        res.redirect('/stores/orders');
                    });
                });
            });
        };
    });

    //Index
    app.get('/stores/orders', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_orders', true, req, res, allowed => {
            var query = {};
            query.co = Number(req.query.co) || 2;
            fn.getAllOrders(query, req, orders => {
                fn.getAllSuppliers(req, suppliers => {
                    res.render('stores/orders/index',{
                        orders:    orders,
                        query:     query,
                        suppliers: suppliers
                    });
                });
            });
        });
    });

    //Show
    app.get('/stores/orders/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_orders', false, req, res, allowed => {
            var query = {};
            query.ul = Number(req.query.ul) || 1,
            query.dl = Number(req.query.dl) || 1,
            query.rl = Number(req.query.rl) || 1,
            query.il = Number(req.query.il) || 2;
            query.sn = Number(req.query.sn) || 2;
            fn.getOrder(query, req.params.id, req, order => {
                if (order) {
                    if (allowed || order.orderedFor.user_id === req.user.user_id) {
                        fn.getNotes('orders', req.params.id, req, res, notes => {
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
                } else {
                    req.flash('danger', 'Order not found')
                    res.redirect('/stores/orders');
                };
            });
        });
    });
};
