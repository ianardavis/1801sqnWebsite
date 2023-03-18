const fs = require('fs');
module.exports = (app, fn) => {
    app.get('/files/:id',           fn.loggedIn(), fn.permissions.get('supplier_admin'),    (req, res) => res.render('stores/files/show'));
    app.get('/get/fs_files',        fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fs.readdir(
            `${process.env.ROOT}/public/res/files`,
            function(err, files) {
                res.send({success: true, result: files});
            }
        );
    });
    app.get('/get/files',           fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.get_all(
            req.query.where,
            fn.pagination(req.query)
        )
        .then(results => fn.send_res('files', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file',            fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.get(req.query.where)
        .then(file => res.send({success: true,  result: file}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file_details',    fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.details.get_all(
            req.query.where,
            fn.pagination(req.query)
        )
        .then(results => fn.send_res('details', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file_detail',     fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.details.get(req.query.where)
        .then(detail => res.send({success: true, result: detail}))
        .catch(err => fn.send_error(res, err));
    });

    app.get('/files/:id/download',  fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.download(req.params.id, res)
        .catch(err => fn.send_error(res, err));
    });

    app.put('/files',               fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.edit(req.body.file_id, req.body.file)
        .then(result => res.send({success: true, message: 'File updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/file_details',        fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.details.edit(req.body.file_detail_id, req.body.detail)
        .then(detail => res.send({success: true,  message: 'Details updated'}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/files',              fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.create(req.body.file, req.files.uploaded, req.user.user_id)
        .then(result => res.send({success: true, message: 'File uploaded'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/file_details',       fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.details.create(req.body.detail, req.user.user_id)
        .then(result => res.send({success: true, message: 'Detail saved'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/files/:id',        fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.delete(req.params.id)
        .then(result => res.send({success: true, message: 'File deleted'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/fs_files/:id',     fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        const path = fn.public_file('files', req.params.id);
        fn.rm(path)
        .then(result => res.send({success: true,  message: 'File deleted'}))
        .catch(err =>   fn.send_error(res, err));
    });
    app.delete('/file_details/:id', fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.details.delete(req.params.id)
        .then(result => res.send({success: true,  message: 'Detail deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};