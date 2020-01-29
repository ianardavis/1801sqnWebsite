const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    app.get('/stores/reports', isLoggedIn, allowed('access_reports'), (req, res) => res.render('stores/reports/index'));

    app.get('/stores/reports/:id', isLoggedIn, allowed('access_reports'), (req, res) => {
        if (Number(req.params.id) === 1) {
            fn.getAllWhere(
                m.stock,
                {_qty: {[op.lt]: 0}},
                {include: [m.locations, {model: m.item_sizes, include: fn.itemSize_inc()}], nullOk: true}
            )
            .then(stock => res.render('stores/reports/show/1', {stock: stock}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else if (Number(req.params.id) === 2) {
            fn.getAllWhere(
                m.issues,
                {
                    _date_due: {[op.lte]: Date.now()},
                    _complete: 0
                },
                {include: [{model: m.issues_l, as: 'lines'}, fn.users('_for')], nullOk: true}
            )
            .then(issues => res.render('stores/reports/show/2', {issues: issues}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else if (Number(req.params.id) === 3) {
            fn.getAll(
                m.items,
                [{
                    model: m.item_sizes,
                    where: {_orderable: 1},
                    include: [
                        m.stock,
                        {
                            model: m.suppliers,
                            where: {supplier_id: Number(req.query.supplier_id) || 1}
                        },{
                            model: m.orders_l,
                            where: {demand_line_id: null},
                            required: false
                        },{
                            model: m.requests_l,
                            where: {_status: 'Pending'},
                            required: false
                        }
                    ]
                }]
            )
            .then(items => {
                fn.getAllWhere(m.suppliers, {supplier_id: {[op.not]: 3}})
                .then(suppliers => res.render('stores/reports/show/3', {items: items, suppliers: suppliers, supplier_id: req.query.supplier_id || 1}))
                .catch(err => fn.error(err, '/stores/reports', req, res));
            })
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else if (Number(req.params.id) === 4) {
            fn.getAll(
                m.items,
                [{
                    model: m.item_sizes,
                    include: [{
                        model: m.stock,
                        include: [
                            m.locations,
                            {
                                model: m.item_sizes,
                                include: fn.itemSize_inc()
                            }
                        ]
                    }]
                }]                
            )
            .then(items => res.render('stores/reports/show/4', {items: items}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else if (Number(req.params.id) === 5) {
            fn.getAll(
                m.locations,
                [{
                    model: m.stock,
                    include: [{
                        model: m.item_sizes,
                        include: fn.itemSize_inc()
                    }]
                }]
            )
            .then(locations => res.render('stores/reports/show/5', {locations: locations}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else {
            req.flash('danger', 'Invalid report');
            res.redirect('/stores/reports');
        };
    });

    app.post('/stores/reports/3', isLoggedIn, allowed('access_reports'), (req, res) => {
        let selected = []
        for (let [key, line] of Object.entries(req.body.selected)) {
            if (Number(line) > 0) selected.push({itemsize_id: key, qty: line});
        };
        if (selected.length > 0) {
            fn.createOrder(
                req.body.ordered_for,
                selected,
                req.user.user_id
            )
            .then(order_id => {
                if (Number(req.body.ordered_for) === -1) res.redirect('/stores/reports/3')
                else res.redirect('/stores/reports/3');
            })
            .catch(err => fn.error(err, '/stores/reports/3', req, res));
        } else {
            req.flash('info', 'No items selected');
            res.redirect('/stores/reports/3');
        };
    });
};