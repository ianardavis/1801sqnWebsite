const fs = require('fs');
module.exports = (app, m, fn) => {
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
        m.files.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('files', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file',            fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        m.files.findOne({
            where: req.query.where,
            include: [fn.inc.users.user()]
        })
        .then(file => {
            if (file) res.send({success: true,  result: file})
            else res.send({success: false, message: 'File not found'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file_details',    fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        m.file_details.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('details', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file_detail',     fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        m.file_details.findOne({where: req.query.where})
        .then(detail => {
            if (detail) res.send({success: true, result: detail})
            else res.send({success: false, message: 'Detail not found'});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.get('/files/:id/download',  fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.get(req.params.id)
        .then(file => {
            if (!file.filename || file.filename === '') fn.send_error(res, 'No filename')
            else {
                fn.fs.file_exists('files', file.filename)
                .then(exists => {
                    const filepath = fn.public_file('files', file.filename);
                    fs.access(filepath, fs.constants.R_OK, function (err) {
                        if (err) {
                            fn.send_error(res, err);
                        } else {
                            res.download(filepath, function (err) {
                                if (err) console.log(err);
                            });
                        };
                    });
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/files',               fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.edit(req.body.file_id, req.body.file)
        .then(result => res.send({success: result, message: `File ${(result ? '' : 'not ')}updated`}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/file_details',        fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.details.edit(req.body.file_detail_id, req.body.detail)
        .then(detail => res.send({success: true,  message: 'Details updated'}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/files',              fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        if      (!req.files) fn.send_error(res, 'No file submitted')
        else if (Object.keys(req.files).length > 1) {
            let actions = [];
            for (const [key, value] of Object.entries(req.files)) {
                actions.push(fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${value.uuid}`))
            };
            Promise.allSettled(actions)
            .then(results => fn.send_error(res, 'Multiple files submitted'))
            .catch(err =>    fn.send_error(res, err));
        } else {
            fn.fs.upload_file({
                ...req.files.uploaded,
                ...req.body.file,
                user_id: req.user.user_id
            })
            .then(result => {
                fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${req.files.uploaded.uuid}`)
                .then(result => res.send({success: true, message: 'FIle uploaded'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(error => {
                fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${req.files.uploaded.uuid}`)
                .then(result => fn.send_error(res, error))
                .catch(err => fn.send_error(res, err));
            });
        };
    });
    app.post('/file_details',       fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.get(req.body.detail.file_id)
        .then(file => {
            m.file_details.findOrCreate({
                where: {
                    file_id: req.body.detail.file_id,
                    name:    req.body.detail.name
                },
                defaults: {
                    value: req.body.detail.value,
                    user_id: req.user.user_id
                }
            })
            .then(([detail, created]) => {
                if (created) res.send({success: true, message: 'Detail added'})
                else {
                    fn.update(detail, {
                        value:   req.body.detail.value,
                        user_id: req.user.user_id
                    })
                    .then(result => res.send({success: true, message: 'Existing detail updated'}))
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/files/:id',        fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        fn.files.get(req.params.id)
        .then(file => {
            file.destroy()
            .then(result => {
                const path = fn.public_file('files', file.filename);
                fn.rm(path)
                .then(result => res.send({success: true, message: 'File deleted'}))
                .catch(err =>   res.send({success: true, message: `Error deleting file: ${err.message}`}));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/fs_files/:id',     fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        const path = fn.public_file('files', req.params.id);
        fn.rm(path)
        .then(result => res.send({success: true,  message: 'File deleted'}))
        .catch(err =>   fn.send_error(res, err));
    });
    app.delete('/file_details/:id', fn.loggedIn(), fn.permissions.check('supplier_admin'),  (req, res) => {
        m.file_details.destroy({
            where: {file_detail_id: req.params.id}
        })
        .then(result => {
            if (!result) fn.send_error(res, 'Detail not deleted')
            else         res.send({success: true,  message: 'Detail deleted'});
        })
        .catch(err => fn.send_error(res, err));
    });
};