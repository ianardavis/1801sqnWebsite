module.exports = (app, m, pm, op, inc, li, send_error) => {
    let fn = {};
    require(`${process.env.FUNCS}/download`)(fn);
    require(`${process.env.FUNCS}/counter`)(fn);
    require(`${process.env.FUNCS}/demands`)(m, fn, op);
    require(`${process.env.FUNCS}/promise_results`)(fn);
    app.get('/demands',              li, pm.get('access_demands'),        (req, res) => res.render('stores/demands/index'));
    app.get('/demands/:id',          li, pm.get('access_demands'),        (req, res) => res.render('stores/demands/show'));
    app.get('/demands/:id/download', li, pm.check('access_demands'),      (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['filename']
        })
        .then(demand => {
            if      (!demand)          send_error(res, 'Demand not found')
            else if (!demand.filename) send_error(res, 'This demand does not have a file')
            else fn.download(demand.filename, req, res);
        })
        .catch(err => send_error(res, err));
    });

    app.get('/count/demands',        li, pm.check('access_demands'),      (req, res) => {
        m.demands.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    app.get('/count/demand_lines',   li, pm.check('access_demand_lines'), (req, res) => {
        m.demand_lines.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    
    app.get('/get/demand',           li, pm.check('access_demands'),      (req, res) => {
        m.demands.findOne({
            where: req.query,
            include: [
                inc.user(),
                inc.supplier()
            ]
        })
        .then(demand => {
            if (!demand) send_error(res, 'Demand not found')
            else res.send({success: true, result: demand});
        })
        .catch(err => send_error(res, err));
    });
    app.get('/get/demands',          li, pm.check('access_demands'),      (req, res) => {
        m.demands.findAll({
            where:   req.query,
            include: [
                inc.user(),
                inc.supplier()
            ]
        })
        .then(demands => res.send({success: true, result: demands}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/demand_lines',     li, pm.check('access_demand_lines'), (req, res) => {
        m.demand_lines.findAll({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.demand()
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/demand_line',      li, pm.check('access_demand_lines'), (req, res) => {
        m.demand_lines.findOne({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.demand(),
                inc.actions({include: [inc.orders()]})
            ]
        })
        .then(line => res.send({success: true, result: line}))
        .catch(err => send_error(res, err));
    });

    app.post('/sizes/:id/demand',    li, pm.check('issue_add'),           (req, res) => {
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
            .catch(err => send_error(res, err));
        } else send_error(res, 'No lines');
    });
    app.post('/demands',             li, pm.check('demand_add'),          (req, res) => {
        fn.demands.create({
            supplier_id: req.body.supplier_id,
            user_id:     req.user.user_id
        })
        .then(demand => res.send({success: true, message: (demand.created ? 'There is already a demand open for this supplier' : 'Demand raised')}))
        .catch(err => send_error(res, err));
    });
    app.put('/demands/:id/complete', li, pm.check('demand_edit'),         (req, res) => {
        fn.demands.complete(req.params.id, req.user.user_id)
        .then(result => res.send(result))
        .catch(err => send_error(res, err));
    });
    app.put('/demands/:id/close',    li, pm.check('demand_edit'),         (req, res) => {
        fn.demands.close(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Demand closed'}))
        .catch(err => send_error(res, err));
    });
    app.put('/demand_lines',         li, pm.check('demand_line_edit'),    (req, res) => {
        if (!req.body.actions || req.body.actions.length === 0) send_error(res, 'No lines submitted')
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
            .catch(err => send_error(res, err));
        };
    });
    
    app.delete('/demands/:id',       li, pm.check('demand_delete'),       (req, res) => {
        fn.demands.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Demand Cancelled'}))
        .catch(err => send_error(res, err));
    });
    app.delete('/demand_lines/:id',  li, pm.check('demand_line_delete'),  (req, res) => {
        fn.demands.lines.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => send_error(res, err));
    });
};