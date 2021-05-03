module.exports = (app, m, pm, op, inc, li, send_error) => {
    let fn = {};
    require(`${process.env.FUNCS}/download`)(fn);
    require(`${process.env.FUNCS}/counter`)(fn);
    require(`${process.env.FUNCS}/demands`)(m, fn);
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
                        op_or:     op.or,
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

    app.put('/demands/raise/:id',    li, pm.check('demand_edit'),         (req, res) => {
        raise_demand(req.params.id, req.user.user_id)
        .then(result => res.send(result))
        .catch(err => send_error(res, err));
    });
    app.put('/demands/:id/complete', li, pm.check('demand_edit'),         (req, res) => {
        fn.demands.complete(req.params.id, req.user.user_id)
        .then(result => res.send(result))
        .catch(err => send_error(res, err));
    });
    app.put('/demands/:id/close',    li, pm.check('demand_edit'),         (req, res) => {
        fn.demands.close(req.params.id, req.user.user_id, op.or)
        .then(result => res.send({success: true, message: 'Demand closed'}))
        .catch(err => send_error(res, err));
    });
    app.put('/demand_lines/:id',     li, pm.check('receipt_add'),         (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['demand_id', 'supplier_id']
        })
        .then(demand => {
            let actions = [], receives = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                if      (line.status === '3') receives.push(line);
                else if (line.status === '0') {
                    actions.push(
                        m.demand_lines.update(
                            {status: 0},
                            {where: {line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        new Promise((resolve, reject) => {
                            m.order_line_actions.findAll({
                                where: {
                                    action: 'Demand',
                                    action_line_id: line.line_id
                                },
                                attributes: ['order_line_id']
                            })
                            .then(actions => {
                                if (actions.length > 0) {
                                    let order_actions = [];
                                    actions.forEach(e => {
                                        order_actions.push(
                                            m.order_lines.update(
                                                {status: 2},
                                                {where: {
                                                    line_id: e.order_line_id,
                                                    status: 3
                                                }}
                                            )
                                        );
                                        order_actions.push(
                                            m.order_line_actions.create({
                                                order_line_id:  e.order_line_id,
                                                action_line_id: line.line_id,
                                                action:        'Demand line cancelled',
                                                user_id:        req.user.user_id
                                            })
                                        );
                                    });
                                    Promise.all(order_actions)
                                    .then(result => resolve(result))
                                    .catch(err => reject(err));
                                } else resolve(true);
                            })
                            .catch(err => reject(err));
                        }),
                    );
                    actions.push(
                        m.demand_line_actions.create({
                            demand_line_id: line.line_id,
                            action:         `Cancelled`,
                            user_id:        req.user.user_id
                        })
                    );
                };
            };
            if (receives.length > 0) {
                receives.forEach(line => {
                    actions.push(
                        fn.demands.lines.receive(
                            line,
                            req.body.receipt,
                            req.user.user_id
                        )
                    );
                });
            };
            Promise.allSettled(actions)
            .then(results => {
                if (fn.promiseResults(results)) res.send({success: true,  message: 'Lines actioned'})
                else send_error(res, 'Some actions failed');
            })
            .catch(err => send_error(res, err));
        })
        .catch(err => send_error(res, err));
    });
    
    app.delete('/demands/:id',       li, pm.check('demand_delete'),       (req, res) => {
        m.demands.findOne({
            where:      {demand_id: req.params.id},
            include:    [inc.demand_lines({where: {status: {[op.not]: 0}}})],
            attributes: ['demand_id', 'status']
        })
        .then(demand => {
            if      (!demand)                                 send_error(res, 'Demand not found')
            else if (demand.status === 0)                     send_error(res, 'This demand is already cancelled')
            else if (demand.lines && demand.lines.length > 0) send_error(res, 'Can not cancel a demand with pending, open or received lines')
            else {
                return demand.update({status: 0})
                .then(result => {
                    if (!result) send_error(res, `Error updating demand: ${err.message}`)
                    else {
                        return m.actions.create({
                            demand_id: demand.demand_id,
                            action: 'Cancelled',
                            user_id: req.user.user_id
                        })
                        .then(action => res.send({success: true,  message: 'Demand Cancelled'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: `Demand cancelled. Error updating demand: ${err.message}`})
                        });
                    };
                })
                .catch(err => send_error(res, err))
            };
        })
        .catch(err => send_error(res, err));
    });
    app.delete('/demand_lines/:id',  li, pm.check('demand_line_delete'),  (req, res) => {
        m.demand_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['line_id', 'status']
        })
        .then(line => {
            if      (line.status === 0) res.send({success: false, message: 'This line has already been cancelled'})
            else if (line.status === 3) res.send({success: false, message: 'This line has already been received'})
            else {
                return line.update({status: 0})
                .then(result => {
                    if (!result) send_error(res, 'Line not updated')
                    else {
                        return m.actions.create({
                            action:         'Cancelled',
                            demand_line_id: line.line_id,
                            user_id:        req.user.user_id
                        })
                        .then(result => res.send({success: true, message: 'Line cancelled'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: `Line cancelled. Error creating note: ${err.message}`});
                        });
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};