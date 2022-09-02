module.exports = (app, m, fn) => {
    let op = require('sequelize').Op;
    app.get('/scraps',              fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scraps/index'));
    app.get('/scraps/:id',          fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scraps/show'));
    app.get('/scrap_lines/:id',     fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scrap_lines/show'));
    function getScrapFilename(scrap_id) {
        return new Promise((resolve, reject) => {
            fn.scraps.get({scrap_id: scrap_id})
            .then(scrap => {
                if (!scrap.filename) {
                    fn.scraps.createPDF(scrap.scrap_id)
                    .then(filename => resolve(filename))
                    .catch(err => reject(err));
                } else resolve(scrap.filename);
            })
            .catch(err => reject(err));
        });
    };
    app.get('/scraps/:id/download', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        getScrapFilename(req.params.id)
        .then(filename => {
            fn.fs.download('scraps', filename, res)
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/scraps/:id/print',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        getScrapFilename(req.params.id)
        .then(filename => {
            fn.pdfs.print('scraps', filename)
            .then(result => res.send({success: true, message: 'Scrap sent to printer'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });

    app.get('/count/scraps',        fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.scraps.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap',           fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.scraps.findOne({
            where: req.query.where,
            include: [
                fn.inc.stores.scrap_lines(),
                fn.inc.stores.supplier()
            ]
        })
        .then(scrap => {
            if (scrap) res.send({success: true,  result: scrap})
            else res.send({success: false, message: 'Scrap not found'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scraps',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.scraps.findAndCountAll({
            where: req.query.where,
            include: [
                {
                    model: m.scrap_lines,
                    as:    'lines',
                    where: {status: {[op.ne]: 0}},
                    required: false
                },
                fn.inc.stores.supplier()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('scraps', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap_lines',     fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        let where = fn.build_query(req.query),
            include = [
                fn.inc.stores.size_filter(req.query),
                fn.inc.stores.nsn(),
                fn.inc.stores.serial(),
                fn.inc.stores.scrap()
            ];
        m.scrap_lines.findAndCountAll({
            where:   where,
            include: include,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('lines', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap_line',      fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.scrap_lines.findOne({
            where: req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.scrap({
                    include: [
                        fn.inc.stores.supplier()
                    ]
                })
            ]
        })
        .then(line => {
            if (line) res.send({success: true, result: line})
            else res.send({success: false, message: 'Line not found'});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/scraps/:id',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.edit(req.params.id, req.body.scrap)
        .then(scrap => res.send({success: true, message: 'Scrap updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/scraps/:id/complete', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.complete(
            req.params.id,
            req.user
        )
        .then(result => {
            res.send({success: true, message: `Scrap completed. File ${(result ? '' : 'not ')}created`})
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/scrap_lines',         fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        let actions = [];
        req.body.lines.filter(e => e.status === '0').forEach(line => actions.push(fn.scraps.lines.cancel({...line, user_id: req.user.user_id})));
        Promise.allSettled(actions)
        .then(results => {
            let scraps = [],
                scrap_checks = [];
            results.filter(e => e.status === 'fulfilled').forEach(e => {if (!scraps.includes(e.value)) scraps.push(e.value)});
            scraps.forEach(scrap_id => {
                scrap_checks.push(new Promise((resolve, reject) => {
                    m.scraps.findOne({
                        where: {scrap_id: scrap_id},
                        include: [{
                            model: m.scrap_lines,
                            as:    'lines',
                            where: {status: {[op.or]: [1]}},
                            required: false
                        }]
                    })
                    .then(scrap => {
                        if (scrap) {
                            if      (scrap.status === 0) reject(new Error('Scrap has already been cancelled'))
                            else if (scrap.status === 1) {
                                if (!scrap.lines || scrap.lines.length === 0) {
                                    fn.scraps.cancel({scrap_id: scrap.scrap_id, user_id: req.user.user_id, noforce: true})
                                    .then(result => resolve(result))
                                    .catch(err => reject(err));
                                } else resolve(false);
                            } else if (scrap.status === 2) reject(new Error('Scrap has already been closed'))
                            else reject(new Error('Unknown scrap status'));
                        }
                        else res.send({success: false, message: 'Scrap not found'});
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
    
    app.delete('/scraps/:id',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.cancel({
            scrap_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => {
            res.send({success: true, message: `Scrap cancelled${(result ? '' : ', action not created')}`});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/scrap_lines/:id',  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.lines.cancel({
            scrap_line_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/scraps/:id/file',  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.fs.delete_file({
            table:   'scraps',
            table_s: 'SCRAP',
            id:      req.params.id,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'File deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};