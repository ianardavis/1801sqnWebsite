const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/orders/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('orders_add', true, req, res, allowed => {
            var user = Number(req.query.user);
            if (!user) user = -1
            if (user !== -1) {
                fn.getOne(
                    m.users,
                    {user_id: user},
                    [m.ranks]
                )
                .then(user => {
                    if (user !== req.user.user_id) {
                        if (user.status_id === 1) {
                            res.render('stores/orders/new', {
                                user: user
                            }); 
                        } else {
                            req.flash('danger', 'Orders can only be made for current users')
                            res.redirect('/stores/users/' + user);
                        };
                    } else {
                        req.flash('info', 'You can not order for yourself, make a request instead');
                        res.redirect('/stores/users/' + user);
                    };
                })
                .catch(err => {
                    fn.error(err, '/stores/users', req, res);
                });
            } else {
                res.render('stores/orders/new', {
                    user: {user_id: -1}
                });
            };
        });
    });
    //New Logic
    app.post('/stores/orders', mw.isLoggedIn, (req, res) => {
        fn.allowed('orders_add', true, req, res, allowed => {
            if (req.body.selected) {
                var newOrder = new cn.Order(req.body.ordered_for, req.user.user_id);
                fn.create(
                    m.orders,
                    newOrder
                )
                .then(order => {
                    var orders = [];
                    req.body.selected.map(item => {
                        if (item) {
                            var line = new cn.OrderLine(order.order_id, JSON.parse(item));
                            orders.push(fn.create(m.orders_l, line));
                        };
                    });
                    if (orders.length > 0) {
                        Promise.all(orders)
                        .then(results => {
                            if (Number(req.body.ordered_for) === -1) {
                                res.redirect('/stores/orders/' + order.order_id);
                            } else {
                                res.redirect('/stores/users/' + req.body.ordered_for);
                            };
                        })
                        .catch(err => {
                            redirect(err, req, res)
                        });
                    } else {
                        fn.delete(
                            m.orders,
                            {order_id: order.order_id}
                        )
                        .then(next => {
                            if (Number(req.body.ordered_for) === -1) {
                                res.redirect('/stores/orders');
                            } else {
                                res.redirect('/stores/users/' + req.body.ordered_for);
                            };
                        })
                        .catch(err => {
                            redirect(err, req, res)
                        });
                    };
                })
                .catch(err => {
                    redirect(err, req, res)
                });
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('back');
            };
        });
    });
    function redirect(err, req, res) {
        if (Number(req.body.ordered_for) === -1) {
            fn.error(err, '/stores/orders', req, res);
        } else {
            fn.error(err, '/stores/users/' + req.body.ordered_for, req, res);
        };
    };

    //delete
    app.delete('/stores/orders/:id', mw.isLoggedIn, (req, res) => {
        if (req.query.user) {
            fn.allowed('orders_delete', true, req, res, allowed => {
                var actions = [];
                actions.push(fn.delete(m.orders_l,{order_id: req.params.id}));
                actions.push(fn.delete(m.orders,{order_id: req.params.id}));
                Promise.all(
                    actions
                )
                .then(results => {
                    req.flash('success', 'Order deleted')
                    res.redirect('/stores/orders');
                })
                .catch(err => {
                    console.log(err);
                    req.flash('danger', err.message)
                    res.redirect('/stores/orders');
                });
            });
        };
    });

    //Index
    app.get('/stores/orders', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_orders', true, req, res, allowed => {
            var query = {},
                where = {};
            query.co = Number(req.query.co) || 2;
            if (query.co === 2) {
                where._complete = 0;
            } else if (query.co === 3) {
                where._complete = 1;
            };
            fn.getAllWhere(
                m.orders,
                where,
                [
                    fn.users('orderedFor'),
                    fn.users('orderedBy'),
                    {model: m.orders_l, as: 'lines'}
                ]
            )
            .then(orders => {
                fn.getAllWhere(
                    m.suppliers,
                    {supplier_id: {[op.not]: 3}}
                )
                .then(suppliers => {
                    res.render('stores/orders/index',{
                        orders:    orders,
                        query:     query,
                        suppliers: suppliers
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

    //Show
    app.get('/stores/orders/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_orders', false, req, res, allowed => {
            var query = {},
                where = {};
            query.ul = Number(req.query.ul) || 1,
            query.dl = Number(req.query.dl) || 1,
            query.rl = Number(req.query.rl) || 1,
            query.il = Number(req.query.il) || 2;
            query.sn = Number(req.query.sn) || 2;
            if (query.dl === 2) {
                where.demand_line_id = {[op.is]: null};
            } else if (query.dl === 3) {
                where.demand_line_id = {[op.not]: null};
            };
            if (query.rl === 2) {
                where.receipt_line_id = {[op.is]: null};
            } else if (query.rl === 3) {
                where.receipt_line_id = {[op.not]: null};
            };
            if (query.il === 2) {
                where.issue_line_id = {[op.is]: null};
            } else if (query.il === 3) {
                where.issue_line_id = {[op.not]: null};
            };
            fn.getOne(
                m.orders,
                {order_id: req.params.id},
                [
                    {
                        model: m.orders_l,
                        as:    'lines',
                        where: where,
                        include: [
                            {model: m.demands_l, include:[m.demands]},
                            {model: m.receipts_l, include:[m.receipts]},
                            {model: m.issues_l, include:[m.issues]},
                            fn.item_sizes(false, true)],
                        required: false
                    },
                    fn.users('orderedFor'),
                    fn.users('orderedBy')
                ]
            )
            .then(order => {
                if (allowed || order.orderedFor.user_id === req.user.user_id) {
                    fn.getNotes('orders', req.params.id, req, res)
                    .then(notes => {
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
            })
            .catch(err => {
                fn.error(err, '/stores/orders', req, res);
            });
        });
    });
};
