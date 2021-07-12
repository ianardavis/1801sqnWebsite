const fs = require('fs');
module.exports = (app, m, fn) => {
    app.get('/files/:id',           fn.loggedIn(), fn.permissions.get('access_files'),          (req, res) => res.render('stores/files/show'));
    app.get('/get/fs_files',        fn.loggedIn(), fn.permissions.check('access_files'),        (req, res) => {
        fs.readdir(
            `${process.env.ROOT}/public/res/files`,
            function(err, files) {
                res.send({success: true, result: files});
            }
        );
    });
    app.get('/get/files',           fn.loggedIn(), fn.permissions.check('access_files'),        (req, res) => {
        m.files.findAll({where: req.query})
        .then(files => res.send({success: true, result: files}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file',            fn.loggedIn(), fn.permissions.check('access_files'),        (req, res) => {
        fn.get(
            'files',
            req.query,
            [fn.inc.users.user()]
        )
        .then(file => res.send({success: true,  result: file}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file_details',    fn.loggedIn(), fn.permissions.check('access_file_details'), (req, res) => {
        m.file_details.findAll({where: req.query})
        .then(details => res.send({success: true, result: details}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file_detail',     fn.loggedIn(), fn.permissions.check('access_file_details'), (req, res) => {
        fn.get(
            'file_details',
            req.query
        )
        .then(detail => res.send({success: true, result: detail}))
        .catch(err => fn.send_error(res, err));
    });

    app.get('/files/:id/download',  fn.loggedIn(), fn.permissions.check('access_files'),        (req, res) => {
        fn.get(
            'files',
            {file_id: req.params.id}
        )
        .then(file => {
            if (!file.filename || file.filename === '') fn.send_error(res, 'No filename')
            else {
                let filepath = `${process.env.ROOT}/public/res/files/${file.filename}`;
                fn.file_exists(filepath)
                .then(exists => {
                    fs.access(filepath, fs.constants.R_OK, function (err) {
                        if (err) fn.send_error(res, err)
                        else {
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
    app.put('/files',               fn.loggedIn(), fn.permissions.check('file_edit'),           (req, res) => {
        fn.get(
            'files',
            {file_id: req.body.file_id}
        )
        .then(file => {
            return file.update(req.body.file)
            .then(result => {
                if (!result) fn.send_error(res, 'File not updated')
                else         res.send({success: true,  message: 'File updated'});
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/file_details',        fn.loggedIn(), fn.permissions.check('file_detail_add'),     (req, res) => {
        fn.get(
            'file_details',
            {file_detail_id: req.body.file_detail_id}
        )
        .then(detail => {
            return detail.update(req.body.detail)
            .then(result => {
                if (!result) fn.send_error(res, 'Detail not updated')
                else         res.send({success: true,  message: 'Details updated'});
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/files',              fn.loggedIn(), fn.permissions.check('file_add'),            (req, res) => {
        if      (!req.files) fn.send_error(res, 'No file submitted')
        else if (Object.keys(req.files).length > 1) {
            let actions = [];
            for (const [key, value] of Object.entries(req.files)) {
                actions.push(fn.rmdir(`${process.env.ROOT}/public/uploads/${value.uuid}`))
            };
            Promise.allSettled(actions)
            .then(results => fn.send_error(res, 'Multiple files submitted'))
            .catch(err =>    fn.send_error(res, err));
        } else {
            fn.upload_file({
                ...req.files.uploaded,
                ...req.body.file,
                user_id: req.user.user_id
            })
            .then(result => {
                fn.rmdir(`${process.env.ROOT}/public/uploads/${req.files.uploaded.uuid}`)
                .then(result => res.send({success: true, message: 'FIle uploaded'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(error => {
                fn.rmdir(`${process.env.ROOT}/public/uploads/${req.files.uploaded.uuid}`)
                .then(result => fn.send_error(res, error))
                .catch(err => fn.send_error(res, err));
            });
        };
    });
    app.post('/file_details',       fn.loggedIn(), fn.permissions.check('file_detail_add'),     (req, res) => {
        fn.get(
            'files',
            {file_id: req.body.detail.file_id}
        )
        .then(file => {
            return m.file_details.findOrCreate({
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
                    return detail.update({
                        value:   req.body.detail.value,
                        user_id: req.user.user_id
                    })
                    .then(result => {
                        if (!result) fn.send_error(res, 'Existing detail not updated')
                        else res.send({success: true, message: 'Existing detail updated'});
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/files/:id',        fn.loggedIn(), fn.permissions.check('file_delete'),         (req, res) => {
        fn.get(
            'files',
            {file_id: req.params.id}
        )
        .then(file => {
            file.destroy()
            .then(result => {
                return fn.rm(`${process.env.ROOT}/public/res/files/${file.filename}`)
                .then(result => res.send({success: true, message: 'File deleted'}))
                .catch(err =>   res.send({success: true, message: `Error deleting file: ${err.message}`}));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/fs_files/:id',     fn.loggedIn(), fn.permissions.check('file_delete'),         (req, res) => {
        fn.rm(`${process.env.ROOT}/public/res/files/${req.params.id}`)
        .then(result => res.send({success: true,  message: 'File deleted'}))
        .catch(err =>   fn.send_error(res, err));
    });
    app.delete('/file_details/:id', fn.loggedIn(), fn.permissions.check('file_detail_delete'),  (req, res) => {
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