const op = require('sequelize').Op;

module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/demands', isLoggedIn, allowed('access_demands'), (req, res) => {
        fn.getAll(m.suppliers)
        .then(suppliers => res.render('stores/demands/index', {suppliers: suppliers}))
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //SHOW
    app.get('/stores/demands/:id', isLoggedIn, allowed('access_demands'), (req, res) => {
        fn.getOne(
            m.demands,
            {demand_id: req.params.id},
            {include: [
                inc.users(),
                m.suppliers
            ]}
        )
        .then(demand => {
            res.render('stores/demands/show', {
                demand: demand,
                notes:  {table: 'demands', id: demand.demand_id},
                show_tab: req.query.tab || 'details'
            });
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
    //ASYNC GET DEMAND
    app.get('/stores/getdemands', isLoggedIn, allowed('access_demands', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.demands,
            req.query,
            {include: [
                inc.demand_lines(),
                inc.users(),
                inc.suppliers({as: 'supplier'})
        ]})
        .then(demands => res.send({result: true, demands: demands}))
        .catch(err => fn.send_error(err.message, res));
    });//ASYNC GET LINES
    app.get('/stores/getdemandlines', isLoggedIn, allowed('access_demand_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.demand_lines,
            req.query,
            {include: [inc.sizes({stock: true})]}
        )
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err.message, res));
    });

    //POST
    app.post('/stores/demands', isLoggedIn, allowed('demand_add', {send: true}), (req, res) => {
        fn.createDemand({
            supplier_id: req.body.supplier_id,
            user_id: req.user.user_id
        })
        .then(result => {
            let message = 'Demand raised: ';
            if (!result.created) message = 'There is already a demand open for this supplier: ';
            res.send({result: true, message: message + result.demand_id});
        })
        .catch(err => fn.send_error(err.message, res));
    });
    app.post('/stores/demand_lines/:id', isLoggedIn, allowed('demand_line_add', {send: true}), (req, res) => {
        req.body.line.demand_id = req.params.id;
        req.body.line.user_id   = req.user.user_id;
        fn.createDemandLine(req.body.line)
        .then(message => res.send({result: true, message: 'Item added: ' + message}))
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
            'demand_lines',
            {demand_id: req.params.id},
            true
        )
        .then(result => {
            fn.delete(
                'demands',
                {demand_id: req.params.id}
            )
            .then(result => res.send({result: true, message: 'Demand deleted'}))
            .catch(err => fn.send_error(err.message, res));
        })
        .catch(err => fn.send_error(err.message, res));
    });
    app.delete('/stores/demand_lines/:id', isLoggedIn, allowed('demand_delete', {send: true}), (req, res) => {
        fn.delete('demand_lines', {line_id: req.params.id})
        .then(result => res.send({result: true, message: 'Line deleted'}))
        .catch(err => fn.send_error(err.message, res));
    });
};