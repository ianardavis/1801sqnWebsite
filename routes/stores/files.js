const fs = require('fs');
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //EDIT
    app.get('/stores/files/:id/edit', isLoggedIn, allowed('file_edit'),                 (req, res) => {
        fn.getOne(
            m.files,
            {file_id: req.params.id}
        )
        .then(file => {
            if (file) res.render('stores/files/edit', {file: file});
            else res.redirect('/stores/suppliers');
        })
        .catch(err => fn.error(err, '/stores/suppliers', req, res));
    });
    
    //PUT
    app.put('/stores/files/:id',      isLoggedIn, allowed('file_edit',   {send: true}), (req, res) => {
        fn.update(
            m.files,
            req.body.file,
            {file_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'File details saved'}))
        .catch(err => fn.send_error(err, res));
    });
    
    //POST
    app.post('/stores/files',         isLoggedIn, allowed('file_add',    {send: true}), (req, res) => {
        if (!req.files || Object.keys(req.files).length !== 1) fn.send_error('No file or multiple files selected', res)
        else {
            let uploaded = req.files.demandfile;
            fs.rename(
                uploaded.file,
                process.env.ROOT + '/public/res/files/' + uploaded.filename,
                function (err) {
                    if (err) throw err
                    fn.create(
                        m.files,
                        {_path: uploaded.filename}
                    )
                    .then(file => {
                        fn.update(
                            m.suppliers,
                            {file_id: file.file_id},
                            {supplier_id: req.body.supplier_id}
                        )
                        .then(result => {
                            if (result) res.send({result: true, message: 'File uploaded'}) 
                            else fn.send_error('Error uploading demand file', res);
                        })
                        .catch(err => fn.send_error(err, res));
                    })
                    .catch(err => fn.send_error(err, res));
                }
            );
        };
    });

    //DELETE
    app.delete('/stores/files/:id',   isLoggedIn, allowed('file_delete', {send: true}), (req, res) => {
        fn.getOne(
            m.files,
            {file_id: req.params.id}
        )
        .then(file => {
            fn.delete(
                m.files,
                {file_id: req.params.id}
            )
            .then(result => {
                fn.update(
                    m.suppliers,
                    {file_id: null},
                    {file_id: req.params.id}
                )
                .then(result => {
                    try {
                        fs.unlinkSync(process.env.ROOT + '/public/res/files/' + file._path)
                        res.send({result: true, message: 'File deleted'});
                    } catch(err) {
                        fn.send_error(err, res);
                    };
                })
                .catch(err => fn.send_error(err, res));
            })
            .catch(err => fn.send_error(err, res));
        })
        .catch(err => fn.send_error(err, res));
    });
};