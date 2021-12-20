module.exports = (app, m, fn) => {
    app.get('/loancards',                    fn.loggedIn(), fn.permissions.get('access_stores'),         (req, res) => res.render('stores/loancards/index'));
    app.get('/loancards/:id',                fn.loggedIn(), fn.permissions.get('access_stores'),         (req, res) => res.render('stores/loancards/show'));
    app.get('/loancard_lines/:id',           fn.loggedIn(), fn.permissions.get('access_stores'),         (req, res) => res.render('stores/loancard_lines/show'));
    app.get('/loancards/:id/download',       fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        fn.get(
            'loancards',
            {loancard_id: req.params.id}
        )
        .then(loancard => {
            if (!loancard.filename) {
                return fn.loancards.createPDF(loancard.loancard_id)
                .then(filename => {
                    fn.download('loancards', filename, res)
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            } else {
                fn.download('loancards', loancard.filename, res)
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/loancards/:id/print',          fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        fn.get(
            'loancards',
            {loancard_id: req.params.id}
        )
        .then(loancard => {
            if (!loancard.filename) {
                return fn.loancards.createPDF(loancard.loancard_id)
                .then(filename => {
                    fn.print_pdf(`${process.env.ROOT}/public/res/loancards/${filename}`)
                    .then(result => res.send({success: true, message: 'Loancard sent to printer'}))
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            }else {
                fn.print_pdf(`${process.env.ROOT}/public/res/loancards/${loancard.filename}`)
                .then(result => res.send({success: true, message: 'Loancard sent to printer'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.get('/count/loancards',              fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        m.loancards.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard',                 fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        if (!req.allowed) req.query.user_id_loancard = req.user.user_id;
        fn.get(
            'loancards',
            req.query.where,
            [
                fn.inc.stores.loancard_lines(),
                fn.inc.users.user(),
                fn.inc.users.user({as: 'user_loancard'})
            ]
        )
        .then(loancard => res.send({success: true,  result: loancard}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancards',                fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        if (!req.allowed) req.query.user_id_loancard = req.user.user_id;
        m.loancards.findAndCountAll({
            where: req.query.where,
            include: [
                {
                    model: m.loancard_lines,
                    as: 'lines',
                    where: {status: {[fn.op.ne]: 0}}
                },
                fn.inc.users.user(),
                fn.inc.users.user({as: 'user_loancard'})
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('loancards', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_lines',           fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        m.loancard_lines.findAndCountAll({
            where:   req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.users.user(),
                fn.inc.stores.loancard({
                    ...(!req.allowed ? {
                        where: {user_id_loancard: req.user.user_id},
                        required: true
                    } : {}),
                    include: [
                        fn.inc.users.user(),
                        fn.inc.users.user({as: 'user_loancard'})
                    ]
                })
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('lines', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_line',            fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        fn.get(
            'loancard_lines',
            req.query.where,
            [
                fn.inc.stores.size(),
                fn.inc.users.user(),
                fn.inc.stores.loancard({
                    ...(!req.allowed ? {
                        where: {user_id_loancard: req.user.user_id},
                        required: true
                    } : {}),
                    include: [
                        fn.inc.users.user(),
                        fn.inc.users.user({as: 'user_loancard'})
                    ]
                })
            ]
        )
        .then(loancard_line => res.send({success: true, result: loancard_line}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_lines_due',       fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        m.loancard_lines.findAndCountAll({
            where: {status: 2},
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.loancard({
                    required: true,
                    where: {
                        date_due: {[fn.op.lte]: Date.now()},
                        ...(req.allowed ? null : {user_id_issue: req.user.user_id})
                    },
                    include: [fn.inc.users.user({as: 'user_loancard'})]
                })
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('issues', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/loancards',                   fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.create({
            loancard: {
                user_id_loancard: req.body.supplier_id,
                user_id:          req.user.user_id
            }
        })
        .then(loancard => {
            if (loancard.created) res.send({success: true, message: 'There is already a loancard open for this user'})
            else                  res.send({success: true, message: 'Loancard raised'});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/loancards/:id',                fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.put(
            'loancards',
            {loancard_id: req.params.id},
            req.body.loancard
        )
        .then(loancard => res.send({success: true, message: 'Loancard updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/loancards/:id/complete',       fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.complete({
            loancard_id: req.params.id,
            user_id: req.user.user_id,
            date_due: req.body.date_due || fn.add_years(7)
        })
        .then(result => {
            return fn.loancards.createPDF(req.params.id)
            .then(filename => res.send({success: true, message: `Loancard completed. Filename: ${filename}`}))
            .catch(err => {
                console.log(err);
                res.send({success: true, message: `Loancard completed. Error creating PDF: ${err.message}`});
            });
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/loancard_lines',               fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        let actions = [];
        req.body.lines.filter(e => e.status === '3').forEach(line => actions.push(fn.loancards.lines.return({...line, user_id: req.user.user_id})));
        req.body.lines.filter(e => e.status === '0').forEach(line => actions.push(fn.loancards.lines.cancel({...line, user_id: req.user.user_id})));
        Promise.allSettled(actions)
        .then(results => {
            let loancards = [],
                loancard_checks = [];
            results.filter(e => e.status === 'fulfilled').forEach(e => {if (!loancards.includes(e.value)) loancards.push(e.value)});
            loancards.forEach(loancard => {
                loancard_checks.push(new Promise((resolve, reject) => {
                    return fn.get(
                        'loancards',
                        {loancard_id: loancard},
                        [{
                            model: m.loancard_lines,
                            as:    'lines',
                            where: {status: {[fn.op.or]: [1, 2]}},
                            required: false
                        }]
                    )
                    .then(loancard => {
                        if      (loancard.status === 0) reject(new Error('Loancard has already been cancelled'))
                        else if (loancard.status === 1) {
                            if (!loancard.lines || loancard.lines.length === 0) {
                                return fn.loancards.cancel({loancard_id: loancard.loancard_id, user_id: req.user.user_id, noforce: true})
                                .then(result => resolve(result))
                                .catch(err => reject(err));
                            } else resolve(false);
                        } else if (loancard.status === 2) {
                            if (!loancard.lines || loancard.lines.length === 0) {
                                return fn.loancards.close({loancard_id: loancard.loancard_id, user_id: req.user.user_id})
                                .then(result => resolve(result))
                                .catch(err => reject(err));
                            } else resolve(false);
                        } else if (loancard.status === 3) reject(new Error('Loancard has already been closed'))
                        else reject(new Error('Unknown loancard status'));
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });
                }));
            });
            return Promise.allSettled(loancard_checks)
            .then(results => res.send({success: true, message: 'Lines actioned'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/loancards/:id',             fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.cancel({
            loancard_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => {
            if (!result) res.send({success: true, message: 'Loancard cancelled'})
            else res.send({success: true, message: 'Loancard cancelled, action not created'})
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/loancard_lines/:id',        fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.lines.cancel({
            loancard_line_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/loancards/:id/delete_file', fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.delete_file({
            loancard_id: req.params.id,
            user_id:     req.user.user_id
        })
        .then(result => res.send({success: true, message: 'File deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};