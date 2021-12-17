module.exports = (app, m, fn) => {
    app.get('/demands',              fn.loggedIn(), fn.permissions.get('stores_stock_admin'),           (req, res) => res.render('stores/demands/index'));
    app.get('/demands/:id',          fn.loggedIn(), fn.permissions.get('stores_stock_admin'),           (req, res) => res.render('stores/demands/show'));
    app.get('/demands/:id/download', fn.loggedIn(), fn.permissions.check('stores_stock_admin'),         (req, res) => {
        fn.get(
            'demands',
            {demand_id: req.params.id}
        )
        .then(demand => {
            if (!demand.filename) {
                return fn.demands.raise(demand.demand_id, req.user)
                .then(file => {
                    fn.download('demands', file, res);
                })
                .catch(err => fn.send_error(res, err));
            } else fn.download('demands', demand.filename, res);
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/demand_lines/:id',     fn.loggedIn(), fn.permissions.get('stores_stock_admin'),           (req, res) => res.render('stores/demand_lines/show'));
    
    app.get('/count/demands',        fn.loggedIn(), fn.permissions.check('stores_stock_admin'),         (req, res) => {
        m.demands.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/count/demand_lines',   fn.loggedIn(), fn.permissions.check('stores_stock_admin'),         (req, res) => {
        m.demand_lines.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/demand_lines',     fn.loggedIn(), fn.permissions.check('stores_stock_admin'),         (req, res) => {
        m.demand_lines.sum('qty', {where: req.query})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.get('/get/demand',           fn.loggedIn(), fn.permissions.check('stores_stock_admin'),         (req, res) => {
        fn.get(
            'demands',
            req.query.where,
            [
                fn.inc.users.user(),
                fn.inc.stores.supplier()
            ]
        )
        .then(demand => res.send({success: true, result: demand}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demands',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'),         (req, res) => {
        m.demands.findAll({
            where:   req.query.where,
            include: [
                fn.inc.users.user(),
                fn.inc.stores.supplier()
            ],
            ...fn.pagination(req.query)
        })
        .then(demands => res.send({success: true, result: demands}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demand_lines',     fn.loggedIn(), fn.permissions.check('stores_stock_admin'),         (req, res) => {
        m.demand_lines.findAll({
            where:   req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.users.user(),
                fn.inc.stores.demand()
            ],
            ...fn.pagination(req.query)
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demand_line',      fn.loggedIn(), fn.permissions.check('stores_stock_admin'),         (req, res) => {
        fn.get(
            'demand_lines',
            req.query.where,
            [
                fn.inc.stores.size(),
                fn.inc.users.user(),
                fn.inc.stores.demand()
            ]
        )
        .then(line => res.send({success: true, result: line}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/sizes/:id/demand',    fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        if (req.body.lines) {
            let actions = [];
            req.body.lines.forEach(line => {
                actions.push(
                    fn.demands.lines.create({
                        demand_id: req.body.demand_id,
                        user_id:   req.user.user_id,
                        size_id:   line.size_id,
                        qty:       line.qty
                    })
                );
            });
            Promise.all(actions)
            .then(result => res.send({success: true, message: 'Line(s) created'}))
            .catch(err => fn.send_error(res, err));
        } else fn.send_error(res, 'No lines');
    });
    app.post('/demands',             fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.create({
            supplier_id: req.body.supplier_id,
            user_id:     req.user.user_id
        })
        .then(demand => res.send({success: true, message: (demand.created ? 'There is already a demand open for this supplier' : 'Demand raised')}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/demands/:id/complete', fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.complete(req.params.id, req.user)
        .then(result => res.send(result))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/demands/:id/close',    fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.close(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Demand closed'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/demand_lines',         fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        if (!req.body.actions || req.body.actions.length === 0) fn.send_error(res, 'No lines submitted')
        else {
            let actions = [];
            req.body.actions
            .filter(e => e.status === '0')
            .forEach(line => {
                actions.push(
                    fn.demands.lines.cancel(
                        line.demand_line_id,
                        req.user.user_id)
                );
            });
            req.body.actions
            .filter(e => e.status === '3')
            .forEach(line => {
                actions.push(
                    fn.demands.lines.receive(
                        line,
                        req.user.user_id
                    )
                );
            });
            Promise.all(actions)
            .then(results => res.send({success: true, message: 'Lines actioned'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    
    app.delete('/demands/:id',       fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Demand Cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/demand_lines/:id',  fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};