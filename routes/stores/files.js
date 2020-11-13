const fs = require('fs');
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    app.get('/stores/files/:id',      isLoggedIn, allowed('access_files'),              (req, res) => res.render('stores/files/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/files/:id/edit', isLoggedIn, allowed('file_edit'),                 (req, res) => res.render('stores/files/edit'));
    
    app.put('/stores/files/:id',      isLoggedIn, allowed('file_edit',   {send: true}), (req, res) => {
        m.files.update(
            req.body.file,
            {where: {file_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'File details saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/files',         isLoggedIn, allowed('file_add',    {send: true}), (req, res) => {
        if (!req.files || Object.keys(req.files).length !== 1) res.error.send(`${req.files.length} files or multiple files selected`, res)
        else {
            let uploaded = req.files.demandfile;
            fs.rename(
                uploaded.file,
                process.env.ROOT + `/public/res/files/${uploaded.filename}`,
                err => {
                    if (err) throw err
                    m.files.findOrCreate({where: {_path: uploaded.filename}})
                    .then(([file, created]) => {
                        return m.suppliers.update(
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

    app.delete('/stores/files/:id',   isLoggedIn, allowed('file_delete', {send: true}), (req, res) => {
        m.files.findOne({where: {file_id: req.params.id}})
        .then(file => {
            file.destroy()
            .then(result => {
                m.suppliers.update(
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