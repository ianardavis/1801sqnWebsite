module.exports = (app, fn) => {
    app.get('/scraps',              fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scraps/index'));
    app.get('/scraps/:id',          fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scraps/show'));
    app.get('/scrap_lines/:id',     fn.loggedIn(), fn.permissions.get(  'stores_stock_admin'), (req, res) => res.render('stores/scrap_lines/show'));
    
    app.get('/scraps/:id/download', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.download(req.params.id, res)
        .catch(err => fn.send_error(res, err));
    });
    app.get('/scraps/:id/print',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.print(req.params.id)
        .then(result => res.send({success: true, message: 'Scrap sent to printer'}))
        .catch(err => fn.send_error(res, err));
    });

    app.get('/count/scraps',        fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.count(req.query.where)
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap',           fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.get(req.query.where)
        .then(scrap => res.send({success: true,  result: scrap}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scraps',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.getAll(req.query)
        .then(results => fn.send_res('scraps', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap_line',      fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.lines.get(req.query.where)
        .then(line => res.send({success: true, result: line}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/scrap_lines',     fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.lines.getAll(req.query, fn.pagination(req.query))
        .then(results => fn.send_res('lines', res, results, req.query))
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
        .then(result => res.send({success: true, message: `Scrap completed. File ${(result ? '' : 'not ')}created`}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/scrap_lines',         fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.lines.update(req.body.lines, req.user.user_id)
        .then(results => res.send({success: true, message: 'Lines actioned'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/scraps/:id',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.cancel(
            req.params.id,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: `Scrap cancelled${(result ? '' : ', action not created')}.`}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/scrap_lines/:id',  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.scraps.lines.cancel(
            req.params.id,
            req.body.line.qty,
            req.body.line.location,
            req.user.user_id
        )
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