const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    //New Form
    app.get('/stores/orders/new', isLoggedIn, allowed('orders_add'), (req, res) => {
        let user = Number(req.query.user);
        if (!user) user = -1
        if (user !== -1) {
            fn.getOne(
                m.users,
                {user_id: user},
                {include: [m.ranks], attributes: null, nullOK: false}
            )
            .then(user => {
                if (user !== req.user.user_id) {
                    if (user.status_id === 1) res.render('stores/orders/new', {user: user}); 
                    else {
                        req.flash('danger', 'Orders can only be made for current users')
                        res.redirect('/stores/users/' + user);
                    };
                } else {
                    req.flash('info', 'You can not order for yourself, make a request instead');
                    res.redirect('/stores/users/' + user);
                };
            })
            .catch(err => fn.error(err, '/stores/users', req, res));
        } else res.render('stores/orders/new', {user: {user_id: -1}});
    });
    //New Logic
    app.post('/stores/orders', isLoggedIn, allowed('orders_add'), (req, res) => {
        if (req.body.selected) {
            let items = [];
            for (let [key, line] of Object.entries(req.body.selected)) {
                items.push(line);
            };
            fn.createOrder(
                req.body.ordered_for,
                items,
                req.user.user_id
            )
            .then(order_id => {
                if (Number(req.body.ordered_for) === -1) res.redirect('/stores/orders/' + order_id)
                else res.redirect('/stores/users/' + req.body.ordered_for);
            })
            .catch(err => redirect(err, req, res));
        } else redirect(new Error('No items selected'), req, res);
    });
    function redirect(err, req, res) {
        if (Number(req.body.ordered_for) === -1) fn.error(err, '/stores/orders', req, res) 
        else fn.error(err, '/stores/users/' + req.body.ordered_for, req, res);
    };

    //put
    app.put('/stores/orders/:id', isLoggedIn, allowed('orders_edit'), (req, res) => {
        if (req.body.lines) {
            let actions = [];
            if (req.body.action === 'demand') {
                let lines = req.body.lines.filter(e => !JSON.parse(e).demand_line_id);
                if (lines.length > 0) {
                    let suppliers = [];
                    lines.forEach(line => {
                        line = JSON.parse(line);
                        line.line_ids = [line.line_id];
                        delete line['line_id'];
                        let _index = suppliers.findIndex(e => e.supplier_id === line.supplier_id);
                        if (_index === -1) suppliers.push({supplier_id: line.supplier_id, lines: [line]})
                        else suppliers[_index].lines.push(line);
                    });
                    suppliers.forEach(supplier => actions.push(fn.createDemand(supplier.supplier_id, supplier.lines, req.user.user_id)));
                } else req.flash('info', 'No undemanded lines selected');
            } else if (req.body.action === 'receive') {
                let lines = req.body.lines.filter(e => !JSON.parse(e).receipt_line_id);
                if (lines.length > 0) {
                    let suppliers = [];
                    lines.forEach(line => {
                        line = JSON.parse(line);
                        line.orderLines = [line.line_id];
                        if (line.demand_line_id) line.demandLine = line.demand_line_id;
                        delete line['line_id'];
                        delete line['demand_line_id'];
                        let _index = suppliers.findIndex(e => e.supplier_id === line.supplier_id);
                        if (_index === -1) suppliers.push({supplier_id: line.supplier_id, lines: [line]})
                        else suppliers[_index].lines.push(line);
                    });
                    suppliers.forEach(supplier => actions.push(fn.createReceipt(supplier.supplier_id, supplier.lines, req.user.user_id)));
                } else req.flash('info', 'No unreceived lines selected');
            } else if (req.body.action === 'issue') {
                let lines = req.body.lines.filter(e => !JSON.parse(e).issue_line_id);
                if (lines.length > 0) {
                    if (Number(JSON.parse(lines[0])._for) !== -1) {
                        let items = [], issued_to = JSON.parse(lines[0])._for;
                        lines.forEach(line => {
                            line = JSON.parse(line);
                            let _index = items.findIndex(e => e.itemsize_id === line.itemsize_id);
                            if (_index === -1) items.push({itemsize_id: line.itemsize_id, qty: line.qty, order_line_id: line.line_id})
                            else items[_index].qty += line.qty;
                            actions.push(
                                fn.getOne(
                                    m.item_sizes,
                                    {itemsize_id: line.itemsize_id},
                                    {
                                        include: [m.nsns, m.items, {model: m.stock, include: [m.locations]}],
                                        attributes: null,
                                        nullOK: false
                                    }
                                )
                            )
                        });
                        Promise.allSettled(actions)
                        .then(item_sizes => {
                            fn.getOne(m.users, {user_id: issued_to}, {include: [m.ranks], attributes: null, nullOK: false})
                            .then(user => {
                                items.forEach(item => {
                                    let item_size = item_sizes.filter(e => e.itemsize_id === item.itemsize_id)[0];
                                    item._description = item_size.item._description;
                                    item._size_text   = item_size.size._text;
                                    item.nsns = [];
                                    item_size.nsns.forEach(nsn => item.nsns.push({nsn_id: nsn.nsn_id, _nsn: nsn._nsn}));
                                    item.stocks = [];
                                    item_size.stocks.forEach(stock => item.stocks.push({stock_id: stock.stockj_id, _location: stock.location._location}));
                                });
                                res.render('stores/issues/new', {user: user, items: items});
                            })
                            .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));
                        })
                        .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));
                    } else req.flash('danger', 'Can not issue orders for backing stock');
                } else req.flash('info', 'No unissued lines selected');
            };
            if (actions.length > 0 && req.body.action !== 'issue') {
                Promise.allSettled(actions)
                .then(results => {
                    req.flash('success', 'Lines actioned')
                    res.redirect('/stores/orders/' + req.params.id)
                })
                .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));
            } else if (req.body.action !== 'issue') res.redirect('/stores/orders/' + req.params.id);
        } else {
            req.flash('info', 'No lines selected');
            res.redirect('/stores/orders/' + req.params.id);
        };
    });

    //delete
    app.delete('/stores/orders/:id', isLoggedIn, allowed('orders_delete'), (req, res) => {
        if (req.query.user) {
            fn.delete(
                'orders',
                {order_id: req.params.id},
                {hasLines: true}
            )
            .then(result => {
                req.flash(result.success, result.message);
                res.redirect('/stores/orders');
            })
            .catch(err => fn.error(err, '/stores/issues', req, res));
        };
    });

    //Index
    app.get('/stores/orders', isLoggedIn, allowed('access_orders'), (req, res) => {
        let query = {}, where = {};
        query.co = Number(req.query.co) || 2;
        if (query.co === 2) where._complete = 0
        else if (query.co === 3) where._complete = 1;
        fn.getAllWhere(
            m.orders,
            where,
            {
                include: [
                    fn.users('_for'),
                    fn.users('_by'),
                    {model: m.orders_l, as: 'lines'}
                ],
                nullOk: false,
                attributes: null
            }
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
            .catch(err => fn.error(err, '/stores', req, res));
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });

    //Show
    app.get('/stores/orders/:id', isLoggedIn, allowed('access_orders'), (req, res) => {
        let query = {},
            where = {};
        query.ul = Number(req.query.ul) || 1,
        query.dl = Number(req.query.dl) || 1,
        query.rl = Number(req.query.rl) || 1,
        query.il = Number(req.query.il) || 2;
        query.sn = Number(req.query.sn) || 2;

        if (query.dl === 2) where.demand_line_id = {[op.is]: null}
        else if (query.dl === 3) where.demand_line_id = {[op.not]: null};

        if (query.rl === 2) where.receipt_line_id = {[op.is]: null}
        else if (query.rl === 3) where.receipt_line_id = {[op.not]: null};

        if (query.il === 2) where.issue_line_id = {[op.is]: null}
        else if (query.il === 3) where.issue_line_id = {[op.not]: null};

        fn.getOne(
            m.orders,
            {order_id: req.params.id},
            {include: [
                {
                    model:    m.orders_l,
                    as:       'lines',
                    where:    where,
                    required: false,
                    include: [
                        {model: m.demands_l, include:[m.demands]},
                        {model: m.receipts_l, include:[m.receipts]},
                        {model: m.issues_l, include:[m.issues]},
                        {model: m.item_sizes, include: fn.itemSize_inc()}
                    ]
                },
                fn.users('_for'),
                fn.users('_by')
            ],
            attributes: null,
            nullOK: false}
        )
        .then(order => {
            if (req.allowed || order.orderedFor.user_id === req.user.user_id) {
                fn.getNotes('orders', req.params.id, req)
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
        .catch(err => fn.error(err, '/stores/orders', req, res));
    });
};
