const fs = require('fs');
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/files/:id/edit', isLoggedIn, allowed('file_edit'),                 (req, res) => {
        db.findOne({
            table: m.files,
            where: {file_id: req.params.id}
        })
        .then(file => {
            if (file) res.render('stores/files/edit', {file: file});
            else res.redirect('/stores/suppliers');
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.put('/stores/files/:id',      isLoggedIn, allowed('file_edit',   {send: true}), (req, res) => {
        db.update({
            table: m.files,
            where: {file_id: req.params.id},
            record: req.body.file
        })
        .then(result => res.send({result: true, message: 'File details saved'}))
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/stores/files',         isLoggedIn, allowed('file_add',    {send: true}), (req, res) => {
        if (!req.files || Object.keys(req.files).length !== 1) res.error.send('No file or multiple files selected', res)
        else {
            let uploaded = req.files.demandfile;
            fs.rename(
                uploaded.file,
                process.env.ROOT + '/public/res/files/' + uploaded.filename,
                function (err) {
                    if (err) throw err
                    m.files.create({_path: uploaded.filename})
                    .then(file => {
                        db.update({
                            table: m.suppliers,
                            where: {supplier_id: req.body.supplier_id},
                            record: {file_id: file.file_id}
                        })
                        .then(result => {
                            if (result) res.send({result: true, message: 'File uploaded'}) 
                            else res.error.send('Error uploading demand file', res);
                        })
                        .catch(err => res.error.send(err, res));
                    })
                    .catch(err => res.error.send(err, res));
                }
            );
        };
    });

    app.delete('/stores/files/:id',   isLoggedIn, allowed('file_delete', {send: true}), (req, res) => {
        db.findOne({
            table: m.files,
            where: {file_id: req.params.id}
        })
        .then(file => {
            db.destroy({
                table: m.files,
                where: {file_id: req.params.id}
            })
            .then(result => {
                db.update({
                    table: m.suppliers,
                    where: {file_id: req.params.id},
                    record: {file_id: null}
                })
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