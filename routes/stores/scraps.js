module.exports = (app, m, fn) => {
    app.get('/scraps',                    fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scraps/index'));
    app.get('/scraps/:id',                fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scraps/show'));
    app.get('/scrap_lines/:id',           fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scrap_lines/show'));
    app.get('/scraps/:id/download',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.get(req.params.id)
        .then(scrap => {
            if (!scrap.filename) {
                fn.scraps.createPDF(scrap.scrap_id)
                .then(filename => {
                    fn.download('scraps', filename, res)
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            } else {
                fn.download('scraps', scrap.filename, res)
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/scraps/:id/print',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.get(req.params.id)
        .then(scrap => {
            if (!scrap.filename) {
                fn.scraps.createPDF(scrap.scrap_id)
                .then(filename => {
                    fn.print_pdf(`${process.env.ROOT}/public/res/scraps/${filename}`)
                    .then(result => res.send({success: true, message: 'Scrap sent to printer'}))
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            }else {
                fn.print_pdf(`${process.env.ROOT}/public/res/scraps/${scrap.filename}`)
                .then(result => res.send({success: true, message: 'Scrap sent to printer'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.get('/count/scraps',              fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.scraps.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap',                 fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'scraps',
            req.query.where,
            [
                fn.inc.stores.scrap_lines(),
                fn.inc.stores.supplier()
            ]
        )
        .then(scrap => res.send({success: true,  result: scrap}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scraps',                fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.scraps.findAndCountAll({
            where: req.query.where,
            include: [
                {
                    model: m.scrap_lines,
                    as:    'lines',
                    where: {status: {[fn.op.ne]: 0}},
                    required: false
                },
                fn.inc.stores.supplier()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('scraps', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap_lines',           fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.scrap_lines.findAndCountAll({
            where:   req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.scrap({
                    include: [
                        fn.inc.stores.supplier()
                    ]
                })
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('lines', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap_line',            fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'scrap_lines',
            req.query.where,
            [
                fn.inc.stores.size(),
                fn.inc.stores.scrap({
                    include: [
                        fn.inc.stores.supplier()
                    ]
                })
            ]
        )
        .then(scrap_line => res.send({success: true, result: scrap_line}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/scraps/:id',                fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.put(
            'scraps',
            {scrap_id: req.params.id},
            req.body.scrap
        )
        .then(scrap => res.send({success: true, message: 'Scrap updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/scraps/:id/complete',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.complete({
            scrap_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => {
            fn.scraps.createPDF(req.params.id)
            .then(filename => res.send({success: true, message: `Scrap completed. Filename: ${filename}`}))
            .catch(err => {
                console.log(err);
                res.send({success: true, message: `Scrap completed. Error creating PDF: ${err.message}`});
            });
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/scrap_lines',               fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        let actions = [];
        req.body.lines.filter(e => e.status === '0').forEach(line => actions.push(fn.scraps.lines.cancel({...line, user_id: req.user.user_id})));
        Promise.allSettled(actions)
        .then(results => {
            let scraps = [],
                scrap_checks = [];
            results.filter(e => e.status === 'fulfilled').forEach(e => {if (!scraps.includes(e.value)) scraps.push(e.value)});
            scraps.forEach(scrap_id => {
                scrap_checks.push(new Promise((resolve, reject) => {
                    fn.get(
                        'scraps',
                        {scrap_id: scrap_id},
                        [{
                            model: m.scrap_lines,
                            as:    'lines',
                            where: {status: {[fn.op.or]: [1]}},
                            required: false
                        }]
                    )
                    .then(scrap => {
                        if      (scrap.status === 0) reject(new Error('Scrap has already been cancelled'))
                        else if (scrap.status === 1) {
                            if (!scrap.lines || scrap.lines.length === 0) {
                                fn.scraps.cancel({scrap_id: scrap.scrap_id, user_id: req.user.user_id, noforce: true})
                                .then(result => resolve(result))
                                .catch(err => reject(err));
                            } else resolve(false);
                        } else if (scrap.status === 2) reject(new Error('Scrap has already been closed'))
                        else reject(new Error('Unknown scrap status'));
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });
                }));
            });
            Promise.allSettled(scrap_checks)
            .then(results => res.send({success: true, message: 'Lines actioned'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/scraps/:id',             fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.cancel({
            scrap_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => {
            if (!result) res.send({success: true, message: 'Scrap cancelled'})
            else res.send({success: true, message: 'Scrap cancelled, action not created'})
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/scrap_lines/:id',        fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.lines.cancel({
            scrap_line_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/scraps/:id/delete_file', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.delete_file({
            scrap_id: req.params.id,
            user_id:     req.user.user_id
        })
        .then(result => res.send({success: true, message: 'File deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};