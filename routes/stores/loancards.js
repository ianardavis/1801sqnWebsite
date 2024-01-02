module.exports = (app, fn) => {
    app.get('/loancards',              fn.loggedIn(), fn.permissions.get(  'access_stores'),       (req, res) => res.render('stores/loancards/index'));
    app.get('/loancards/:id',          fn.loggedIn(), fn.permissions.get(  'access_stores'),       (req, res) => res.render('stores/loancards/show'));
    app.get('/loancard_lines/:id',     fn.loggedIn(), fn.permissions.get(  'access_stores'),       (req, res) => res.render('stores/loancard_lines/show'));
    app.get('/loancards/:id/download', fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        fn.loancards.download(req.session.site_id, req.params.id, res)
        .catch(err => fn.sendError(res, err));
    });

    app.get('/count/loancards',        fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        if (!req.allowed) req.query.where.user_id_loancard = req.user.user_id;
        fn.loancards.count(req.session.site_id, req.query.where)
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/loancard',           fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        if (!req.allowed) req.query.where['user_id_loancard'] = req.user.user_id;
        req.query.where.site_id = req.session.site_id;
        fn.loancards.find(
            req.query.where,
            [fn.inc.stores.loancard_lines()]
        )
        .then(loancard => res.send({success: true,  result: loancard}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/loancards',          fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        req.query.where.site_id = req.session.site_id;
        fn.loancards.findAll(
            req.allowed,
            req.query,
            req.user.user_id
        )
        .then(results => fn.sendRes('loancards', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });

    app.get('/get/loancard_lines',     fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        fn.loancards.lines.findAll(
            req.query.where,
            {
                loancard_where: (
                    !req.allowed ? 
                        {where: {user_id_loancard: req.user.user_id}, required: true} :
                        {}
                ),
                pagination: fn.pagination(req.query)
            })
        .then(results => fn.sendRes('lines', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/loancard_line',      fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        fn.loancards.lines.find(
            req.query.where,
            [
                fn.inc.stores.issues(),
                fn.inc.stores.size(),
                fn.inc.stores.nsn(),
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
        .then(line => res.send({success: true, result: line}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/loancard_lines_due', fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        fn.loancards.lines.findAll(
            {status: 2},
            {
                loancard_where: {
                    required: true,
                    where: {
                        date_due: {[fn.op.lte]: Date.now()},
                        ...(req.allowed ? null : {user_id_issue: req.user.user_id})
                    }
                },
                pagination: fn.pagination(req.query)
            }
        )
        .then(results => fn.sendRes('lines', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/loancards',             fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.create(
            req.session.site_id,
            req.body.user_id_loancard,
            req.user.user_id
        )
        .then(loancard => {
            if (loancard.created) {
                res.send({success: true, message: 'There is already a loancard open for this user'});

            }else {
                res.send({success: true, message: 'Loancard raised'});

            };
        })
        .catch(err => fn.sendError(res, err));
    });

    app.put('/loancards/:id',          fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.edit(
            req.session.site_id,
            req.params.id,
            req.body.loancard
        )
        .then(result => res.send({success: result, message: `Loancard ${(result ? '' : 'not ')}updated`}))
        .catch(err => fn.sendError(res, err));
    });
    function add_years(years = 0) {
        let now = new Date();
        return new Date(now.getFullYear() + years, now.getMonth(), now.getDate());
    };
    app.put('/loancards/:id/complete', fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.complete(
            req.session.site_id,
            req.params.id,
            req.user.user_id,
            req.body.date_due || add_years(7)
        )
        .then(fn.loancards.pdf.create)
        .then(filename => res.send({success: true, message: 'Loancard completed.'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/loancard_lines',         fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.lines.process(req.body.lines, req.user.user_id)
        .then(result => res.send({success: true, message: 'Lines actioned'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.delete('/loancards/:id',       fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.loancards.cancel(
            req.session.site_id,
            req.params.id,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: `Loancard cancelled${(result ? '' : ', action not created')}.`}))
        .catch(err => fn.sendError(res, err));
    });
    app.delete('/loancards/:id/file',  fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.fs.deleteFile({
            table:   'loancards',
            table_s: 'LOANCARD',
            id:      req.params.id,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'File deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};