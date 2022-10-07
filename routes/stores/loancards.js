module.exports = (app, m, fn) => {
    app.get('/loancards',              fn.loggedIn(), fn.permissions.get('access_stores'),         (req, res) => res.render('stores/loancards/index'));
    app.get('/loancards/:id',          fn.loggedIn(), fn.permissions.get('access_stores'),         (req, res) => res.render('stores/loancards/show'));
    app.get('/loancard_lines/:id',     fn.loggedIn(), fn.permissions.get('access_stores'),         (req, res) => res.render('stores/loancard_lines/show'));
    function getLoancardFilename(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(loancard_id)
            .then(loancard => {
                if (!loancard.filename) {
                    fn.loancards.pdf.create(loancard.loancard_id)
                    .then(filename => resolve(filename))
                    .catch(err => reject(err));
                } else resolve(loancard.filename);
            })
            .catch(err => reject(err));
        });
    };
    app.get('/loancards/:id/download', fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        getLoancardFilename(req.params.id)
        .then(filename => {
            fn.fs.download('loancards', filename, res)
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/loancards/:id/print',    fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        getLoancardFilename(req.params.id)
        .then(filename => {
            fn.pdfs.print('loancards', filename)
            .then(result => res.send({success: true, message: 'Loancard sent to printer'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });

    app.get('/count/loancards',        fn.loggedIn(), fn.permissions.check('issuer', true),        (req, res) => {
        if (!req.allowed) req.query.where.user_id_loancard = req.user.user_id;
        m.loancards.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard',           fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        if (!req.allowed) req.query.user_id_loancard = req.user.user_id;
        m.loancards.findOne({
            where: req.query.where,
            include: [
                fn.inc.stores.loancard_lines(),
                fn.inc.users.user(),
                fn.inc.users.user({as: 'user_loancard'})
            ]
        })
        .then(loancard => {
            if (loancard) res.send({success: true,  result: loancard})
            else res.send({success: false, message: 'Loancard not found'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancards',          fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        if (!req.allowed) req.query.user_id_loancard = req.user.user_id;
        m.loancards.findAndCountAll({
            where: req.query.where,
            include: [
                {
                    model: m.loancard_lines,
                    as:    'lines',
                    where: {status: {[fn.op.ne]: 0}},
                    required: false
                },
                fn.inc.users.user(),
                fn.inc.users.user({as: 'user_loancard'})
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('loancards', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_lines',     fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
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
    app.get('/get/loancard_line',      fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        m.loancard_lines.findOne({
            where: req.query.where,
            include: [
                {model: m.issues, include: [m.sizes]},
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
        })
        .then(line => {
            if (line) {
                res.send({success: true, result: line});

            } else {
                res.send({success: false, message: 'Line not found'});

            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_lines_due', fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
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
        .then(results => fn.send_res('lines', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/loancards',             fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
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

    app.put('/loancards/:id',          fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.edit(req.params.id, req.body.loancard)
        .then(result => res.send({success: result, message: `Loancard ${(result ? '' : 'not ')}updated`}))
        .catch(err => fn.send_error(res, err));
    });
    function add_years(years = 0) {
        let now = new Date();
        return new Date(now.getFullYear() + years, now.getMonth(), now.getDate());
    };
    app.put('/loancards/:id/complete', fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.complete({
            loancard_id: req.params.id,
            user_id: req.user.user_id,
            date_due: req.body.date_due || add_years(7)
        })
        .then(result => {
            fn.loancards.pdf.create(req.params.id)
            .then(filename => res.send({success: true, message: `Loancard completed. Filename: ${filename}`}))
            .catch(err => {
                console.log(err);
                res.send({success: true, message: `Loancard completed. Error creating PDF: ${err.message}`});
            });
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/loancard_lines',         fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.lines.process(req.body.lines, req.user.user_id)
        .then(result => res.send({success: true, message: 'Lines actioned'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/loancards/:id',       fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
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
    // app.delete('/loancard_lines/:id',  fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
    //     fn.loancards.lines.cancel({
    //         loancard_line_id: req.params.id,
    //         user_id: req.user.user_id
    //     })
    //     .then(result => res.send({success: true, message: 'Line cancelled'}))
    //     .catch(err => fn.send_error(res, err));
    // });
    app.delete('/loancards/:id/file',  fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.fs.delete_file({
            table:   'loancards',
            table_s: 'LOANCARD',
            id:      req.params.id,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'File deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};