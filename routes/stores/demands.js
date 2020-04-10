const op = require('sequelize').Op;

module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/demands', isLoggedIn, allowed('access_demands'), (req, res) => {
        let query = {}, where = {};
        query.complete    = Number(req.query.complete)    || 2;
        query.supplier_id = Number(req.query.supplier_id) || 0;
        if (query.complete === 2)      where._complete   = 0
        else if (query.complete === 3) where._complete   = 1;
        if (query.supplier_id !== 0)   where.supplier_id = query.supplier_id;
        fn.getAllWhere(
            m.demands,
            where,
            {
                include: [
                    inc.users(),
                    inc.demand_lines(),
                    m.suppliers
                ]
            }
        )
        .then(demands => {
            fn.getAllWhere(
                m.suppliers,
                {supplier_id: {[op.not]: 3}}
            )
            .then(suppliers => {
                res.render('stores/demands/index', {
                    suppliers: suppliers,
                    demands:   demands,
                    query:     query
                });
            })
            .catch(err => fn.error(err, '/stores', req, res));
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //SHOW
    app.get('/stores/demands/:id', isLoggedIn, allowed('access_demands'), (req, res) => {
        fn.getOne(
            m.demands,
            {demand_id: req.params.id},
            {include: [
                inc.users(),
                m.suppliers,
                inc.demand_lines({sizes: true, include: [
                    inc.sizes({stock: true})
                ]}),
            ]}
        )
        .then(demand => {
            fn.getNotes('demands', req.params.id, req)
            .then(notes => {
                res.render('stores/demands/show', {
                    demand: demand,
                    query:  {system: Number(req.query.system) || 2},
                    notes:  notes,
                    show_tab: req.query.tab || 'details'
                });
            })
        })
        .catch(err => fn.error(err, '/stores/demands', req, res));
    });
    //DOWNLOAD
    app.get('/stores/demands/:id/download', isLoggedIn, allowed('access_demands'), (req, res) => {
        fn.getOne(
            m.demands,
            {demand_id: req.params.id}
        )
        .then(demand => {
            if (demand && demand._filename && demand._filename !== '') fn.downloadFile(demand._filename, res);
            else {
                req.flash('danger', 'No file found');
                res.redirect('/stores/demands/' + req.params.id);
            };
        })
        .catch(err => fn.error(err, '/stores/demands', req, res));
    });

    //POST
    app.post('/stores/demands', isLoggedIn, allowed('demand_add', {send: true}), (req, res) => {
        fn.createDemand(req.query.supplier_id)
        .then(demand_id => res.send({result: true, message: 'Demand raised: ' + demand_id}))
        .catch(err => res.send_error(err.message, res));
    });
    app.post('/stores/demands/:id', isLoggedIn, allowed('demand_add', {send: true}), (req, res) => {
        fn.createDemandLine(req.params.id, req.body.line)
        .then(message => res.send({result: true, message: message}))
        .catch(err => fn.send_error(err.message, res))
    });

    //PUT
    app.put('/stores/demands/:id/complete', isLoggedIn, allowed('demand_edit', {send: true}), (req, res) => {
        fn.getOne(
            m.demands,
            {demand_id: req.params.id},
            {include: [inc.suppliers({include: [inc.files()]})]}
        )
        .then(demand => {
            if (demand._complete) res.send_error('This demand is already complete', res)
            else if (!demand.supplier._raise_demand) res.send_error('Demands are not raised for this supplier', res)
            else if (demand.supplier.file) {
                fn.getAllWhere(
                    m.demand_lines,
                    {demand_id: demand.demand_id},
                    {
                        attributes: ['line_id', 'size_id', '_qty'],
                        include: [inc.sizes()]
                    }
                )
                .then(lines => {
                    let items = [], rejects = false;
                    lines.forEach(line => {
                        if (line.size._demand_page && line.size._demand_cell) {
                            items.push({
                                size_id: line.size_id,
                                qty:    line._qty,
                                page:    line.size._demand_page,
                                cell:    line.size._demand_cell
                            })
                        } else rejects = true;
                    });
                    fn.raiseDemand(
                        items
                    )
                })
                .catch(err => fn.send_error(err.message, res));
            } else {
                fn.update(
                    m.demands,
                    {_complete: 1},
                    {demand_id: demand.demand_id}
                )
                .then(result => res.send({result: true, message: 'Demand completed'}))
                .catch(err => fn.send_error(err.message, res));
            };
        })
        .catch(err => fn.send_error(err.message, res));
    });
    app.put('/stores/demands/:id', isLoggedIn, allowed('receipt_add', {send: true}), (req, res) => {
        if (req.body.selected) {
            if (req.body.action === 'receive') {
                fn.receive_demand_lines(req.body.selected)
                .then(results => {
                    if (results.noStocks) req.flash('danger', 'Some items have no stock records');
                    res.render('stores/receipts/new', results);
                })
                .catch(err => fn.error(err, '/stores/demands/' + req.params.id, req, res));
            } else if (req.body.action === 'cancel') {
                fn.cancel_demand_lines(req.body.selected, req.params.id, req.user.user_id)
                .then(result => {
                    req.flash('success', 'Lines cancelled');
                    res.redirect('/stores/demands/' + req.params.id);
                })
                .catch(err => fn.error(err, '/stores/demands/' + req.params.id,req, res));
            } else {
                req.flash('danger', 'Invalid request');
                res.redirect('/stores/demands/' + req.params.id);
            };
        } else {
            req.flash('info', 'No lines selected');
            res.redirect('/stores/demands/' + req.params.id);
        };
    });
    
    //DELETE
    app.delete('/stores/demands/:id', isLoggedIn, allowed('demand_delete', {send: true}), (req, res) => {
        fn.delete(
            'demands',
            {demand_id: req.params.id},
            {hasLines: true}
        )
        .then(result => res.send({result: result.success, message: result.message}))
        .catch(err => fn.send_error(err.message, res));
    });
};