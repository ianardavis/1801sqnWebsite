module.exports = (app, m, inc, fn) => {
    app.get('/demands',              fn.li(), fn.permissions.get('access_demands'),        (req, res) => res.render('stores/demands/index'));
    app.get('/demands/:id',          fn.li(), fn.permissions.get('access_demands'),        (req, res) => res.render('stores/demands/show'));
    app.get('/demands/:id/download', fn.li(), fn.permissions.check('access_demands'),      (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['demand_id', 'filename']
        })
        .then(demand => {
            if      (!demand)          fn.send_error(res, 'Demand not found')
            else if (!demand.filename) {
                return fn.demands.raise(demand.demand_id, req.user)
                .then(file => {
                    fn.download('demands', file, res);
                })
                .catch(err => fn.send_error(res, err));
            } else fn.download('demands', demand.filename, res);
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/demand_lines/:id',     fn.li(), fn.permissions.get('access_demand_lines'),   (req, res) => res.render('stores/demand_lines/show'));
    
    app.get('/count/demands',        fn.li(), fn.permissions.check('access_demands'),      (req, res) => {
        m.demands.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/count/demand_lines',   fn.li(), fn.permissions.check('access_demand_lines'), (req, res) => {
        m.demand_lines.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/demand_lines',     fn.li(), fn.permissions.check('access_demand_lines'), (req, res) => {
        m.demand_lines.sum('qty', {where: req.query})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.get('/get/demand',           fn.li(), fn.permissions.check('access_demands'),      (req, res) => {
        m.demands.findOne({
            where: req.query,
            include: [
                inc.user(),
                inc.supplier()
            ]
        })
        .then(demand => {
            if (!demand) fn.send_error(res, 'Demand not found')
            else res.send({success: true, result: demand});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demands',          fn.li(), fn.permissions.check('access_demands'),      (req, res) => {
        m.demands.findAll({
            where:   req.query,
            include: [
                inc.user(),
                inc.supplier()
            ]
        })
        .then(demands => res.send({success: true, result: demands}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demand_lines',     fn.li(), fn.permissions.check('access_demand_lines'), (req, res) => {
        m.demand_lines.findAll({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.demand()
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demand_line',      fn.li(), fn.permissions.check('access_demand_lines'), (req, res) => {
        m.demand_lines.findOne({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.demand()
            ]
        })
        .then(line => res.send({success: true, result: line}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/sizes/:id/demand',    fn.li(), fn.permissions.check('issue_add'),           (req, res) => {
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
    app.post('/demands',             fn.li(), fn.permissions.check('demand_add'),          (req, res) => {
        fn.demands.create({
            supplier_id: req.body.supplier_id,
            user_id:     req.user.user_id
        })
        .then(demand => res.send({success: true, message: (demand.created ? 'There is already a demand open for this supplier' : 'Demand raised')}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/demands/:id/complete', fn.li(), fn.permissions.check('demand_edit'),         (req, res) => {
        fn.demands.complete(req.params.id, req.user)
        .then(result => res.send(result))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/demands/:id/close',    fn.li(), fn.permissions.check('demand_edit'),         (req, res) => {
        fn.demands.close(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Demand closed'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/demand_lines',         fn.li(), fn.permissions.check('demand_line_edit'),    (req, res) => {
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
    
    app.delete('/demands/:id',       fn.li(), fn.permissions.check('demand_delete'),       (req, res) => {
        fn.demands.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Demand Cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/demand_lines/:id',  fn.li(), fn.permissions.check('demand_line_delete'),  (req, res) => {
        fn.demands.lines.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};