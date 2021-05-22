const fs = require('fs');
module.exports = (app, m, inc, fn) => {
    app.get('/files/:id',           fn.li(), fn.permissions.get('access_files'),          (req, res) => res.render('stores/files/show'));
    app.get('/get/fs_files',        fn.li(), fn.permissions.check('access_files'),        (req, res) => {
        fs.readdir(
            `${process.env.ROOT}/public/res/files`,
            function(err, files) {
                res.send({success: true, result: files});
            }
        );
    });
    app.get('/get/files',           fn.li(), fn.permissions.check('access_files'),        (req, res) => {
        m.files.findAll({where: req.query})
        .then(files => res.send({success: true, result: files}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file',            fn.li(), fn.permissions.check('access_files'),        (req, res) => {
        m.files.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(file => {
            if (!file) fn.send_error(res, 'File not found')
            else       res.send({success: true,  result: file});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file_details',    fn.li(), fn.permissions.check('access_file_details'), (req, res) => {
        m.file_details.findAll({where: req.query})
        .then(details => res.send({success: true, result: details}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/file_detail',     fn.li(), fn.permissions.check('access_file_details'), (req, res) => {
        m.file_details.findOne({where: req.query})
        .then(detail => {
            if (!detail) fn.send_error(res, 'Detail not found')
            else         res.send({success: true, result: detail});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.get('/files/:id/download',  fn.li(), fn.permissions.check('access_files'),        (req, res) => {
        m.files.findOne({
            where: {file_id: req.params.id},
            attributes: ['file_id', '_filename']
        })
        .then(file => {
            if      (!file)                                    fn.send_error(res, 'File not found')
            else if (!file._filename || file._filename === '') fn.send_error(res, 'No filename')
            else {
                let filepath = `${process.env.ROOT}/public/res/files/${file._filename}`;
                fs.access(filepath, fs.constants.R_OK, function (err) {
                    if (err) fn.send_error(res, err)
                    else {
                        res.download(filepath, function (err) {
                            if (err) console.log(err);
                        });
                    };
                });
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/files',               fn.li(), fn.permissions.check('file_edit'),           (req, res) => {
        m.files.findOne({
            where: {file_id: req.body.file_id}
        })
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
    app.put('/file_details',        fn.li(), fn.permissions.check('file_edit'),           (req, res) => {
        m.file_details.findOne({
            where: {file_detail_id: req.body.file_detail_id}
        })
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

    app.post('/files',              fn.li(), fn.permissions.check('file_add'),            (req, res) => {
        let uploaded = req.files.file;
        if      (!req.files)                          fn.send_error(res, 'No file submitted')
        else if (Object.keys(req.files).length !== 1) fn.send_error(res, 'Multiple files submitted')
        else {
            m.suppliers.findOne({
                where: {supplier_id: req.body.file.supplier_id},
                attributes: ['supplier_id']
            })
            .then(supplier => {
                if (!supplier) fn.send_error(res, 'Supplier not found')
                else {
                    fs.copyFile(
                        uploaded.file,
                        `${process.env.ROOT}/public/res/files/${uploaded.filename}`,
                        fs.constants.COPYFILE_EXCL,
                        function (err) {
                            if (err) {
                                if (err.code === 'EEXIST') fn.send_error(res, 'Error copying file: This file already exists')
                                else fn.send_error(res, err);
                            } else {
                                return m.files.findOrCreate({
                                    where: {_filename: uploaded.filename},
                                    defaults: {
                                        ...req.body.file,
                                        ...{user_id: req.user.user_id}
                                    }
                                })
                                .then(([file, created]) => {
                                    if (!created) fn.send_error(res, 'File already exists')
                                    else          res.send({success: true,  message: 'File uploaded'});
                                })
                                .catch(err => fn.send_error(res, err));
                            };
                        }
                    );
                };
            })
            .catch(err => fn.send_error(res, err));
        };
        fs.rmdir(
            `${process.env.ROOT}/public/uploads/${uploaded.uuid}`,
            {recursive: true},
            function (err) {
                if (err) console.log('Error deleting temporary file', err);
            }
        );
    });
    app.post('/file_details',       fn.li(), fn.permissions.check('file_detail_add'),     (req, res) => {
        m.files.findOne({
            where: {file_id: req.body.detail.file_id},
            attributes: ['file_id']
        })
        .then(file => {
            if (!file) fn.send_error(res, 'File not found')
            else {
                req.body.detail.user_id = req.user.user_id;
                return m.file_details.create(req.body.detail)
                .then(detail => res.send({success: true, message: 'Detail added'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/files/:id',        fn.li(), fn.permissions.check('file_delete'),         (req, res) => {
        m.files.findOne({
            where: {file_id: req.params.id},
            attributes: ['file_id', '_filename']
        })
        .then(file => {
            if (!file) fn.send_error(res, 'File not found')
            else {
                file.destroy()
                .then(result => {
                    return delete_fs_file(`${process.env.ROOT}/public/res/files/${file._filename}`)
                    .then(result => res.send({success: true, message: 'File deleted'}))
                    .catch(err =>   res.send({success: true, message: `Error deleting file: ${err.message}`}));
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/fs_files/:id',     fn.li(), fn.permissions.check('file_delete'),         (req, res) => {
        delete_fs_file(`${process.env.ROOT}/public/res/files/${req.params.id}`)
        .then(result => res.send({success: true,  message: 'File deleted'}))
        .catch(err =>   fn.send_error(res, err));
    });
    app.delete('/file_details/:id', fn.li(), fn.permissions.check('file_detail_delete'),  (req, res) => {
        m.file_details.destroy({
            where: {file_detail_id: req.params.id}
        })
        .then(result => {
            if (!result) fn.send_error(res, 'Detail not deleted')
            else         res.send({success: true,  message: 'Detail deleted'});
        })
        .catch(err => fn.send_error(res, err));
    });
    function delete_fs_file(file) {
        return new Promise((resolve, reject) => {
            fs.access(file, fs.constants.R_OK, function (err) {
                if (err) reject(err)
                else {
                    fs.unlink(file, function (err) {
                        if (err) reject(new Error(err))
                        else     resolve(true);
                    });
                };
            });
        });
    };
};