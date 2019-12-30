module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // Edit
    app.get('/stores/files/:id/edit', isLoggedIn, allowed('files_edit'), (req, res) => {
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
    
    // Put
    app.put('/stores/files/:id', isLoggedIn, allowed('files_edit'), (req, res) => {
        fn.update(
            m.files,
            req.body.file,
            {file_id: req.params.id}
        )
        .then(result => {
            if (result) req.flash('success', 'File updated')
            res.redirect('/stores/suppliers')
        })
        .catch(err => fn.error(err, '/stores/suppliers', req, res));
    });
    
    // New
    app.post('/stores/files', isLoggedIn, allowed('files_add'), (req, res) => {
        if (!req.files || Object.keys(req.files).length !== 1) {
            req.flash('info', 'No file or multiple files selected')
            res.redirect('/stores/suppliers/' + req.query.s)
        } else {
            let uploaded = req.files.demandfile;
            uploaded.mv(process.env.ROOT + '/public/res/files/' + req.files.demandfile.name)
            .then(result => {
                fn.create(
                    m.files,
                    {_path: req.files.demandfile.name}
                )
                .then(file => {
                    fn.update(
                        m.suppliers,
                        {file_id: file.file_id},
                        {supplier_id: req.query.s}
                    )
                    .then(result => {
                        if (result) {
                            req.flash('success', 'Demand file uploaded');
                            res.redirect('/stores/files/' + file.file_id + '/edit');
                        } else fn.error(new Error('Error uploading demand file'), '/stores/suppliers/' + req.query.s, req, res);
                    })
                    .catch(err => fn.error(err, '/stores/suppliers/' + req.query.s, req, res));
                })
                .catch(err => fn.error(err, '/stores/suppliers/' + req.query.s, req, res));
            })
            .catch(err => fn.error(err, '/stores/suppliers/' + req.query.s, req, res));
        };
    });
};