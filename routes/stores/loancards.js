module.exports = (app, m, inc, fn) => {
    app.get('/loancards',              fn.li(), fn.permissions.get('access_loancards'),                  (req, res) => res.render('stores/loancards/index'));
    app.get('/loancards/:id',          fn.li(), fn.permissions.get('access_loancards'),                  (req, res) => res.render('stores/loancards/show'));
    app.get('/loancard_lines/:id',     fn.li(), fn.permissions.get('access_loancard_lines'),             (req, res) => res.render('stores/loancard_lines/show'));
    app.get('/loancards/:id/download', fn.li(), fn.permissions.check('access_loancards'),                (req, res) => {
        fn.loancards.get(req.params.id)
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
    app.get('/loancards/:id/print',    fn.li(), fn.permissions.check('access_loancards'),                (req, res) => {
        fn.loancards.get(req.params.id)
        .then(loancard => {
            if (!loancard.filename) fn.send_error(res, 'No file')
            else {
                fn.print_pdf(`${process.env.ROOT}/public/res/loancards/${loancard.filename}`)
                .then(result => res.send({success: true, message: 'Loancard sent to printer'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });


    app.get('/count/loancards',        fn.li(), fn.permissions.check('access_loancards'),                (req, res) => {
        m.loancards.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard',           fn.li(), fn.permissions.check('access_loancards'),                (req, res) => {
        m.loancards.findOne({
            where: req.query,
            include: [
                inc.loancard_lines(),
                inc.user(),
                inc.user({as: 'user_loancard'})
            ]
        })
        .then(loancard => {
            if (loancard) res.send({success: true,  result: loancard})
            else          fn.send_error(res, 'Loancard not found');
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancards',          fn.li(), fn.permissions.check('access_loancards', {allow: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_loancard = req.user.user_id;
        m.loancards.findAll({
            where: req.query,
            include: [
                inc.loancard_lines(),
                inc.user({as: 'user'}),
                inc.user({as: 'user_loancard'})
            ]
        })
        .then(loancards => res.send({success: true, result: loancards}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_lines',     fn.li(), fn.permissions.check('access_loancard_lines'),           (req, res) => {
        m.loancard_lines.findAll({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.loancard({include: [inc.user(), inc.user({as: 'user_loancard'})]})
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/loancard_line',      fn.li(), fn.permissions.check('access_loancard_lines'),           (req, res) => {
        m.loancard_lines.findOne({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.loancard({include: [inc.user(), inc.user({as: 'user_loancard'})]}),
                inc.actions({include: [inc.order()]})
            ]
        })
        .then(loancard_line => res.send({success: true, result: loancard_line}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/loancards',             fn.li(), fn.permissions.check('loancard_add'),                    (req, res) => {
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

    app.put('/loancards/:id',          fn.li(), fn.permissions.check('loancard_edit'),                   (req, res) => {
        fn.loancards.complete({
            loancard_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => {
            return fn.loancards.createPDF(req.params.id)
            .then(filename => res.send({success: true, message: `Loancard completed. Filename: ${filename}`}))
            .catch(err =>     res.send({success: true, message: `Loancard completed. Error creating PDF: ${err.message}`}));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/loancard_lines',         fn.li(), fn.permissions.check('loancard_line_edit'),              (req, res) => {
        let actions = [];
        req.body.lines.filter(e => e.status === '3').forEach(line => actions.push(fn.loancards.lines.return({...line, user_id: req.user.user_id})));
        req.body.lines.filter(e => e.status === '0').forEach(line => actions.push(fn.loancards.lines.cancel({...line, user_id: req.user.user_id})));
        Promise.all(actions)
        .then(results => {
            res.send({success: true, message: 'Lines actioned'});
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/loancards/:id',       fn.li(), fn.permissions.check('loancard_delete'),                 (req, res) => {
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
    app.delete('/loancard_lines/:id',  fn.li(), fn.permissions.check('loancard_line_delete'),            (req, res) => {
        fn.loancards.lines.cancel({
            loancard_line_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};