const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/reports',     isLoggedIn, allowed('access_reports'), (req, res) => res.render('stores/reports/index'));

    app.get('/stores/reports/:id', isLoggedIn, allowed('access_reports'), (req, res) => {
        if (Number(req.params.id) === 1) {
            fn.getAllWhere(
                m.stock,
                {_qty: {[op.lt]: 0}},
                {include: [
                    m.locations,
                    inc.sizes()
                ],
                nullOk: true}
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
                {
                    include: [
                        inc.issue_lines(),
                        inc.users({as: '_to'})
                    ],
                    nullOk: true
                }
            )
            .then(issues => res.render('stores/reports/show/2', {issues: issues}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else if (Number(req.params.id) === 3) {
            fn.getAll(
                m.items,
                [{
                    model: m.sizes,
                    where: {_orderable: 1},
                    include: [
                        m.stock,
                        inc.suppliers({where: {supplier_id: Number(req.query.supplier_id) || 1}}),
                        inc.order_lines({as: 'orders', where: {demand_line_id: null}}),
                        inc.request_lines({as: 'requests', where: {_status: 'Pending'}})
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
                    model: m.sizes,
                    include: [inc.stock({size: true})]
                }]                
            )
            .then(items => res.render('stores/reports/show/4', {items: items}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else if (Number(req.params.id) === 5) {
            fn.getAll(
                m.locations,
                [inc.stock({size: true})]
            )
            .then(locations => {
                locations.sort(function(a, b) {
                    var locationA = a._location.toUpperCase(); // ignore upper and lowercase
                    var locationB = b._location.toUpperCase(); // ignore upper and lowercase
                    if (locationA < locationB) {
                      return -1;
                    }
                    if (locationA > locationB) {
                      return 1;
                    }
                  
                    // names must be equal
                    return 0;
                  });
                res.render('stores/reports/show/5', {locations: locations})
            })
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else {
            req.flash('danger', 'Invalid report');
            res.redirect('/stores/reports');
        };
    });

    app.post('/stores/reports/3',  isLoggedIn, allowed('access_reports'), (req, res) => {
        let selected = []
        for (let [key, line] of Object.entries(req.body.selected)) {
            if (Number(line) > 0) selected.push({size_id: key, qty: line});
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

    app.post('/stores/reports/5',  isLoggedIn, allowed('access_reports'), (req, res) => {
        let actions = [];
        for (let [key, value] of Object.entries(req.body.corrections)) {
            if (value) {
                let stock_id = Number(String(key).replace('stock_id_', ''));
                actions.push(
                    fn.adjustStock(
                        'Count',
                        stock_id,
                        Number(value),
                        req.user.user_id
                    )
                );
            };
        };
        Promise.allSettled(actions)
        .then(results => {
            req.flash('success', 'Counts actioned');
            res.redirect('/stores/reports/5');
        })
        .catch(err => {
            req.flash('danger', 'Error actioning some lines, check and try again');
            res.redirect('/stores/reports/5');
        });
    });
};