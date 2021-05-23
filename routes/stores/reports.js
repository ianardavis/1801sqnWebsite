module.exports = (app, m, inc, fn) => {
    let orders = {}, stock = {};
    app.get('/reports',     fn.li(), fn.permissions.get('access_reports'),   (req, res) => res.render('stores/reports/index'));

    app.get('/reports/:id', fn.li(), fn.permissions.check('access_reports'), (req, res) => {
        if (Number(req.params.id) === 1) {
            m.stock.findAll({
                where: {_qty: {[fn.op.lt]: 0}},
                include: [
                    m.locations,
                    inc.sizes()
            ]})
            .then(stock => res.render('stores/reports/show/1', {stock: stock}))
            .catch(err => fn.send_error(res, err));
        } else if (Number(req.params.id) === 2) {
            m.issues.findAll({
                where: {
                    _date_due: {[fn.op.lte]: Date.now()},
                    _complete: 0
                },
                include: [
                        inc.issue_lines(),
                        inc.users({as: 'user_to'})
                    ]
            })
            .then(issues => res.render('stores/reports/show/2', {issues: issues}))
            .catch(err => fn.send_error(res, err));
        } else if (Number(req.params.id) === 3) {
            m.items.findAll({
                include: [{
                    model: m.sizes,
                    where: {_orderable: 1},
                    include: [
                        m.stock,
                        inc.suppliers({where: {supplier_id: Number(req.query.supplier_id) || 1}}),
                        inc.order_lines({as: 'orders', where: {demand_line_id: null}}),
                        inc.request_lines({as: 'requests', where: {_status: 'Pending'}})
            ]}]})
            .then(items => {
                m.suppliers.findAll()
                .then(suppliers => res.render('stores/reports/show/3', {items: items, suppliers: suppliers, supplier_id: req.query.supplier_id || 1}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        } else if (Number(req.params.id) === 4) {
            m.items.findAll({
                include: [{
                    model: m.sizes,
                    include: [inc.stock({size: true})]
                }]
            })
            .then(items => res.render('stores/reports/show/4', {items: items}))
            .catch(err => fn.send_error(res, err));
        } else if (Number(req.params.id) === 5) {
            m.locations.findAll({
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
            .catch(err => fn.send_error(res, err));
        } else fn.send_error(res, 'Invalid Report');
    });

    app.post('/reports/3',  fn.li(), fn.permissions.check('access_reports'), (req, res) => {
        let selected = []
        for (let [key, line] of Object.entries(req.body.selected)) {
            if (Number(line) > 0) selected.push({size_id: key, _qty: line});
        };
        if (selected.length > 0) {
            orders.create({
                order: {
                    user_id_order: req.body.user_id_order,
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
                .then(results => res.redirect('/reports/3'))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        } else {
            req.flash('info', 'No items selected');
            res.redirect('/reports/3');
        };
    });

    app.post('/reports/5',  fn.li(), fn.permissions.check('access_reports'), (req, res) => {
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
            res.redirect('/reports/5');
        })
        .catch(err => {
            req.flash('danger', 'Error actioning some lines, check and try again');
            res.redirect('/reports/5');
        });
    });
};