module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //New
    app.get('/stores/notes/new', isLoggedIn, allowed('note_add'), (req, res) => {
        res.render('stores/notes/new', {
            table: req.query.table,
            id:    req.query.id
        });
    });
    //New logic
    app.post('/stores/notes', isLoggedIn, allowed('note_add', false), (req, res) => {
        if (!req.allowed) {
            res.send({result: false, error: 'Permission denied'})
        } else {
            req.body.note.user_id = req.user.user_id;
            req.body.note._date = Date.now();
            fn.create(m.notes, req.body.note)
            .then(note => res.send({result: true}))
            .catch(err => res.send({result: false, error: err.message}));
        };
    });

    //Edit
    app.get('/stores/notes/:id/edit', isLoggedIn, allowed('note_add'), (req, res) => {
        fn.getOne(
            m.notes,
            {note_id: req.params.id}
        )
        .then(note => res.render('stores/notes/edit', {note: note}))
        .catch(err => fn.error(err, 'back', req, res));
    });
    // Put
    app.put('/stores/notes/:id', isLoggedIn, allowed('note_edit'), (req, res) => {
        if (!req.allowed) {
            res.send({result: false, error: 'Permission denied'})
        } else {
            req.body.note.user_id = req.user.user_id;
            req.body.note._date = Date.now();
            fn.update(
                m.notes,
                req.body.note,
                {note_id: req.params.id}
            )
            .then(note => res.send({result: true}))
            .catch(err => res.send({result: false, error: err.message}));
        };
    });
    
    //Show
    app.get('/stores/notes/:id', isLoggedIn, allowed('access_notes'), (req, res) => {
        fn.getOne(
            m.notes,
            {note_id: req.params.id},
            {include: [inc.users()]}
        )
        .then(note => res.render('stores/notes/show', {note: note}))
        .catch(err => fn.error(err, 'back', req, res));
    });

    //Delete
    app.delete('/stores/notes/:id', isLoggedIn, allowed('note_delete'), (req, res) => {
        fn.delete(
            'notes',
            {note_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Note deleted')
            res.redirect('back')
        })
        .catch(err =>fn.error(err, 'back', req, res));
    });
};