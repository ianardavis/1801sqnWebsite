const fs = require('fs');
module.exports = (app, allowed, inc, loggedIn, m) => {
    app.get('/stores/files/:id',      loggedIn, allowed('access_files'),               (req, res) => res.render('stores/files/show'));
    app.get('/stores/files/:id/edit', loggedIn, allowed('file_edit'),                  (req, res) => res.render('stores/files/edit'));
    
    app.get('/stores/get/files',      loggedIn, allowed('access_files', {send: true}), (req, res) => {
        m.stores.files.findAll({where: req.query})
        .then(files => res.send({result: true, files: files}))
        .catch(err => res.error.send(err, res));
    });

    app.put('/stores/files/:id',      loggedIn, allowed('file_edit',    {send: true}), (req, res) => {
        m.stores.files.update(
            req.body.file,
            {where: {file_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'File details saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/files',         loggedIn, allowed('file_add',     {send: true}), (req, res) => {
        if (!req.files || Object.keys(req.files).length !== 1) res.error.send(`${req.files.length} files or multiple files selected`, res)
        else {
            let uploaded = req.files.demandfile;
            fs.rename(
                uploaded.file,
                process.env.ROOT + `/public/res/files/${uploaded.filename}`,
                err => {
                    if (err) throw err
                    m.stores.files.findOrCreate({where: {_path: uploaded.filename}})
                    .then(([file, created]) => {
                        return m.stores.suppliers.update(
                            {file_id: file.file_id},
                            {where: {supplier_id: req.body.supplier_id}}
                        )
                        .then(result => res.send({result: true, message: 'File uploaded'}))
                        .catch(err => res.error.send(err, res));
                    })
                    .catch(err => res.error.send(err, res));
                }
            );
        };
    });

    app.delete('/stores/files/:id',   loggedIn, allowed('file_delete',  {send: true}), (req, res) => {
        m.stores.files.findOne({where: {file_id: req.params.id}})
        .then(file => {
            file.destroy()
            .then(result => {
                m.stores.suppliers.update(
                    {file_id: null},
                    {where: {file_id: req.params.id}}
                )
                .then(result => {
                    try {
                        fs.unlinkSync(process.env.ROOT + '/public/res/files/' + file._path)
                        res.send({result: true, message: 'File deleted'});
                    } catch(err) {
                        res.error.send(err, res);
                    };
                })
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
};