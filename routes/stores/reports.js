const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let orders = {}, stock = {};
    require(`${process.env.ROOT}/fn/stores/stock`) (m, stock);
    require(`${process.env.ROOT}/fn/stores/orders`)(m, orders)
    app.get('/stores/reports',     permissions, allowed('access_reports'), (req, res) => res.render('stores/reports/index'));

    app.get('/stores/reports/:id', permissions, allowed('access_reports'), (req, res) => {
        if (Number(req.params.id) === 1) {
            m.stores.stock.findAll({
                where: {_qty: {[op.lt]: 0}},
                include: [
                    m.stores.locations,
                    inc.sizes()
            ]})
            .then(stock => res.render('stores/reports/show/1', {stock: stock}))
            .catch(err => res.error.redirect(err, req, res));
        } else if (Number(req.params.id) === 2) {
            m.stores.issues.findAll({
                where: {
                    _date_due: {[op.lte]: Date.now()},
                    _complete: 0
                },
                include: [
                        inc.issue_lines(),
                        inc.users({as: '_to'})
                    ]
            })
            .then(issues => res.render('stores/reports/show/2', {issues: issues}))
            .catch(err => res.error.redirect(err, req, res));
        } else if (Number(req.params.id) === 3) {
            m.stores.items.findAll({
                include: [{
                    model: m.stores.sizes,
                    where: {_orderable: 1},
                    include: [
                        m.stores.stock,
                        inc.suppliers({where: {supplier_id: Number(req.query.supplier_id) || 1}}),
                        inc.order_lines({as: 'orders', where: {demand_line_id: null}}),
                        inc.request_lines({as: 'requests', where: {_status: 'Pending'}})
            ]}]})
            .then(items => {
                m.stores.suppliers.findAll()
                .then(suppliers => res.render('stores/reports/show/3', {items: items, suppliers: suppliers, supplier_id: req.query.supplier_id || 1}))
                .catch(err => res.error.redirect(err, req, res));
            })
            .catch(err => res.error.redirect(err, req, res));
        } else if (Number(req.params.id) === 4) {
            m.stores.items.findAll({
                include: [{
                    model: m.stores.sizes,
                    include: [inc.stock({size: true})]
                }]
            })
            .then(items => res.render('stores/reports/show/4', {items: items}))
            .catch(err => res.error.redirect(err, req, res));
        } else if (Number(req.params.id) === 5) {
            m.stores.locations.findAll({
                include: [inc.stock({size: true})]
            })
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
            .catch(err => res.error.redirect(err, req, res));
        } else res.error.redirect(new Error('Invalid report'), req, res);
    });

    app.post('/stores/reports/3',  permissions, allowed('access_reports'), (req, res) => {
        let selected = []
        for (let [key, line] of Object.entries(req.body.selected)) {
            if (Number(line) > 0) selected.push({size_id: key, _qty: line});
        };
        if (selected.length > 0) {
            orders.create({
                order: {
                    ordered_for: req.body.ordered_for,
                    user_id: req.user.user_id
                }
            })
            .then(result => {
                let actions = [];
                selected.forEach(line => {
                    line.order_id = result.order_id
                    actions.push(orders.createLine({line: line}))
                })
                Promise.allSettled(actions)
                .then(results => res.redirect('/stores/reports/3'))
                .catch(err => res.error.redirect(err, req, res));
            })
            .catch(err => res.error.redirect(err, req, res));
        } else {
            req.flash('info', 'No items selected');
            res.redirect('/stores/reports/3');
        };
    });

    app.post('/stores/reports/5',  permissions, allowed('access_reports'), (req, res) => {
        let actions = [];
        for (let [key, value] of Object.entries(req.body.corrections)) {
            if (value) {
                let stock_id = Number(String(key).replace('stock_id_', ''));
                actions.push(
                    stock.adjust({
                        adjustment: {
                            stock_id: stock_id,
                            _type:    'Count',
                            _qty:     Number(value),
                            _date:    Date.now(),
                            user_id:  req.user.user_id
                        }
                    })
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