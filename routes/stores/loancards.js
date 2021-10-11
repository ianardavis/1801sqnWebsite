module.exports = (app, m, fn) => {
    app.get('/loancards',                    fn.loggedIn(), fn.permissions.get('access_loancards'),              (req, res) => res.render('stores/loancards/index'));
    app.get('/loancards/:id',                fn.loggedIn(), fn.permissions.get('access_loancards'),              (req, res) => res.render('stores/loancards/show'));
    app.get('/loancard_lines/:id',           fn.loggedIn(), fn.permissions.get('access_loancard_lines'),         (req, res) => res.render('stores/loancard_lines/show'));
    app.get('/loancards/:id/download',       fn.loggedIn(), fn.permissions.check('access_loancards'),            (req, res) => {
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
    app.get('/loancards/:id/print',          fn.loggedIn(), fn.permissions.check('access_loancards'),            (req, res) => {
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

    app.get('/count/loancards',              fn.loggedIn(), fn.permissions.check('access_loancards'),            (req, res) => {
        m.loancards.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard',                 fn.loggedIn(), fn.permissions.check('access_loancards',      true), (req, res) => {
        if (!req.allowed) req.query.user_id_loancard = req.user.user_id;
        fn.get(
            'loancards',
            req.query,
            [
                fn.inc.stores.loancard_lines(),
                fn.inc.users.user(),
                fn.inc.users.user({as: 'user_loancard'})
            ]
        )
        .then(loancard => res.send({success: true,  result: loancard}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancards',                fn.loggedIn(), fn.permissions.check('access_loancards',      true), (req, res) => {
        if (!req.allowed) req.query.user_id_loancard = req.user.user_id;
        m.loancards.findAll({
            where: req.query,
            include: [
                fn.inc.stores.loancard_lines(),
                fn.inc.users.user(),
                fn.inc.users.user({as: 'user_loancard'})
            ]
        })
        .then(loancards => res.send({success: true, result: loancards}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_lines',           fn.loggedIn(), fn.permissions.check('access_loancard_lines', true), (req, res) => {
        m.loancard_lines.findAll({
            where:   req.query,
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
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_line',            fn.loggedIn(), fn.permissions.check('access_loancard_lines', true), (req, res) => {
        fn.get(
            'loancard_lines',
            req.query,
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
    app.get('/get/loancard_lines_due',       fn.loggedIn(), fn.permissions.check('access_loancard_lines'),       (req, res) => {
        m.loancard_lines.findAll({
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
            ]
        })
        .then(issues => res.send({success: true, result: issues}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/loancards',                   fn.loggedIn(), fn.permissions.check('loancard_add'),                (req, res) => {
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

    app.put('/loancards/:id',                fn.loggedIn(), fn.permissions.check('loancard_edit'),               (req, res) => {
        fn.put(
            'loancards',
            {loancard_id: req.params.id},
            req.body.loancard
        )
        .then(loancard => res.send({success: true, message: 'Loancard updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/loancards/:id/complete',       fn.loggedIn(), fn.permissions.check('loancard_edit'),               (req, res) => {
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
    app.put('/loancard_lines',               fn.loggedIn(), fn.permissions.check('loancard_line_edit'),          (req, res) => {
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
                        {loancard_id: loancard}
                    )
                    .then(loancard => {
                        if      (loancard.status === 0) reject(new Error('Loancard has already been cancelled'))
                        else if (loancard.status === 3) reject(new Error('Loancard has already been closed'))
                        else if (loancard.status > 3 || loancard.status < 0) reject(new Error('Unknown loancard status'))
                        else {
                            let check_action = null;
                            if (loancard.status === 1) check_action = fn.loancards.cancel({loancard_id: loancard.loancard_id, user_id: req.user.user_id, noforce: true})
                            else                       check_action = fn.loancards.close( {loancard_id: loancard.loancard_id, user_id: req.user.user_id});
                            return check_action
                            .then(result => resolve(result))
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                }));
            });
            return Promise.allSettled(loancard_checks)
            .then(results => res.send({success: true, message: 'Lines actioned'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/loancards/:id',             fn.loggedIn(), fn.permissions.check('loancard_delete'),             (req, res) => {
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
    app.delete('/loancard_lines/:id',        fn.loggedIn(), fn.permissions.check('loancard_line_delete'),        (req, res) => {
        fn.loancards.lines.cancel({
            loancard_line_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/loancards/:id/delete_file', fn.loggedIn(), fn.permissions.check('loancard_delete'),             (req, res) => {
        fn.loancards.delete_file({
            loancard_id: req.params.id,
            user_id:     req.user.user_id
        })
        .then(result => res.send({success: true, message: 'File deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};