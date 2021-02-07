const fs = require('fs');
module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/files/:id',           pm, al('access_files'),                      (req, res) => res.render('stores/files/show'));
    app.get('/stores/get/fs_files',        pm, al('access_files',        {send: true}), (req, res) => {
        fs.readdir(
            `${process.env.ROOT}/public/res/files`,
            function(err, files) {
                res.send({success: true, result: files});
            }
        );
    });
    app.get('/stores/get/files',           pm, al('access_files',        {send: true}), (req, res) => {
        m.stores.files.findAll({where: req.query})
        .then(files => res.send({success: true, result: files}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/file',            pm, al('access_files',        {send: true}), (req, res) => {
        m.stores.files.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(file => {
            if (!file) res.send({success: false, message: 'File not found'})
            else       res.send({success: true,  result: file});
        })
        .catch(err => res.send({success: false, message: `Error getting file: ${err.message}`}));
    });
    app.get('/stores/get/file_details',    pm, al('access_file_details', {send: true}), (req, res) => {
        m.stores.file_details.findAll({where: req.query})
        .then(details => res.send({success: true, result: details}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/file_detail',     pm, al('access_file_details', {send: true}), (req, res) => {
        m.stores.file_details.findOne({where: req.query})
        .then(detail => {
            if (!detail) res.send({success: false, message: 'Detail not found'})
            else         res.send({success: true, result: detail});
        })
        .catch(err => res.send({success: false, message: `Error getting detail: ${err.message}`}));
    });

    app.get('/stores/files/:id/download',  pm, al('access_files',        {send: true}), (req, res) => {
        m.stores.files.findOne({
            where: {file_id: req.params.id},
            attributes: ['file_id', '_filename']
        })
        .then(file => {
            if      (!file)                                    res.send({success: false, message: 'File not found'})
            else if (!file._filename || file._filename === '') res.send({success: false, message: 'No filename'})
            else {
                let filepath = `${process.env.ROOT}/public/res/files/${file._filename}`;
                fs.access(filepath, fs.constants.R_OK, function (err) {
                    if (err) res.send({success: false, message: 'File does not exist'})
                    else {
                        res.download(filepath, function (err) {
                            if (err) console.log(err);
                        });
                    };
                });
            };
        })
        .catch(err => res.send({success: false, message: `Error getting file: ${err.message}`}));
    });
    app.put('/stores/files',               pm, al('file_edit',           {send: true}), (req, res) => {
        m.stores.files.findOne({
            where: {file_id: req.body.file_id}
        })
        .then(file => {
            return file.update(req.body.file)
            .then(result => {
                if (!result) res.send({success: false, message: 'File not updated'})
                else         res.send({success: true,  message: 'File updated'});
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.send({success: false, message: `Error getting file: ${err.message}`}));
    });
    app.put('/stores/file_details',        pm, al('file_edit',           {send: true}), (req, res) => {
        m.stores.file_details.findOne({
            where: {file_detail_id: req.body.file_detail_id}
        })
        .then(detail => {
            return detail.update(req.body.detail)
            .then(result => {
                if (!result) res.send({success: false, message: 'Detail not updated'})
                else         res.send({success: true,  message: 'Details updated'});
            })
            .catch(err => res.send({success: false, message: `Error updating detail: ${err.message}`}));
        })
        .catch(err => res.send({success: false, message: `Error getting detail: ${err.message}`}))
    });

    app.post('/stores/files',              pm, al('file_add',            {send: true}), (req, res) => {
        let uploaded = req.files.file;
        if      (!req.files)                          res.send({success: false, message: 'No file submitted'})
        else if (Object.keys(req.files).length !== 1) res.send({success: false, message: 'Multiple files submitted'})
        else {
            m.stores.suppliers.findOne({
                where: {supplier_id: req.body.file.supplier_id},
                attributes: ['supplier_id']
            })
            .then(supplier => {
                if (!supplier) res.send({success: false, message: 'Supplier not found'})
                else {
                    const { COPYFILE_EXCL } = fs.constants;
                    fs.copyFile(
                        uploaded.file,
                        `${process.env.ROOT}/public/res/files/${uploaded.filename}`,
                        COPYFILE_EXCL,
                        function (err) {
                            if (err) {
                                if (err.code === 'EEXIST') res.send({success: false, message: 'Error copying file: This file already exists'})
                                else {
                                    console.log(err);
                                    res.send({success: false, message: `Error copying file: ${err.message}`});
                                };
                            } else {
                                return m.stores.files.findOrCreate({
                                    where: {_filename: uploaded.filename},
                                    defaults: {
                                        ...req.body.file,
                                        ...{user_id: req.user.user_id}
                                    }
                                })
                                .then(([file, created]) => {
                                    if (!created) res.send({success: false, message: 'File already exists'})
                                    else          res.send({success: true,  message: 'File uploaded'});
                                })
                                .catch(err => res.error.send(err, res));
                            };
                        }
                    );
                };
            })
            .catch(err => res.send({success: false, message: `Error getting supplier: ${err.message}`}));
        };
        fs.rmdir(
            `${process.env.ROOT}/public/uploads/${uploaded.uuid}`,
            {recursive: true},
            function (err) {
                if (err) console.log('Error deleting temporary file', err);
            }
        );
    });
    app.post('/stores/file_details',       pm, al('file_detail_add',     {send: true}), (req, res) => {
        m.stores.files.findOne({
            where: {file_id: req.body.detail.file_id},
            attributes: ['file_id']
        })
        .then(file => {
            if (!file) res.send({success: false, message: 'File not found'})
            else {
                req.body.detail.user_id = req.user.user_id;
                return m.stores.file_details.create(req.body.detail)
                .then(detail => res.send({success: true, message: 'Detail added'}))
                .catch(err => res.send({success: false, message: `Error adding detail: ${err.message}`}));
            };
        })
        .catch(err => res.send({success: false, message: `Error getting file: ${err.message}`}));
    });

    app.delete('/stores/files/:id',        pm, al('file_delete',         {send: true}), (req, res) => {
        m.stores.files.findOne({
            where: {file_id: req.params.id},
            attributes: ['file_id', '_filename']
        })
        .then(file => {
            if (!file) res.send({success: false, message: 'File not found'})
            else {
                file.destroy()
                .then(result => {
                    return delete_fs_file(`${process.env.ROOT}/public/res/files/${file._filename}`)
                    .then(result => res.send({success: true, message: 'File deleted'}))
                    .catch(err =>   res.send({success: true, message: `Error deleting file: ${err.message}`}));
                })
                .catch(err => res.send({success: false, message: `Error deleting file: ${err.message}`}));
            };
        })
        .catch(err => res.send({success: false, message: `Error getting file: ${err.message}`}));
    });
    app.delete('/stores/fs_files/:id',     pm, al('file_delete',         {send: true}), (req, res) => {
        delete_fs_file(`${process.env.ROOT}/public/res/files/${req.params.id}`)
        .then(result => res.send({success: true,  message: 'File deleted'}))
        .catch(err =>   res.send({success: false, message: `Error deleting file: ${err.message}`}));
    });
    app.delete('/stores/file_details/:id', pm, al('file_detail_delete',  {send: true}), (req, res) => {
        m.stores.file_details.destroy({
            where: {file_detail_id: req.params.id}
        })
        .then(result => {
            if (!result) res.send({success: false, message: 'Detail not deleted'})
            else         res.send({success: true,  message: 'Detail deleted'});
        })
        .catch(err => res.send({success: false, message: `Error deleting detail: ${err.message}`}));
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