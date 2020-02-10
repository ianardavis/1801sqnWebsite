module.exports = (app, allowed, fn, isLoggedIn, m) => {
    //New
    app.get('/stores/notes/new', isLoggedIn, allowed('notes_add'), (req, res) => {
        res.render('stores/notes/new', {
            link: {
                table: req.query.table,
                id:    req.query.id
            }
        });
    });
    //New logic
    app.post('/stores/notes', isLoggedIn, allowed('notes_add'), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        fn.create(
            m.notes,
            req.body.note
        )
        .then(note => {
            req.flash('success', 'Note added')
            res.redirect('/stores/' + note._table + '/' + note._id);
        })
        .catch(err => fn.error(err, 'back', req, res));
    });

    //Edit
    app.get('/stores/notes/:id/edit', isLoggedIn, allowed('notes_add'), (req, res) => {
        fn.getOne(
            m.notes,
            {note_id: req.params.id}
        )
        .then(note => res.render('stores/notes/edit', {note: note}))
        .catch(err => fn.error(err, 'back', req, res));
    });
    // Put
    app.put('/stores/notes/:id', isLoggedIn, allowed('notes_edit'), (req, res) => {
        fn.update(
            m.notes,
            req.body.note,
            {note_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Note updated');
            res.redirect('/stores/' + req.body._table + '/' + req.body._id);
        })
        .catch(err => fn.error(err, '/stores/' + req.body._table + '/' + req.body._id, req, res));
    });
    
    //Show
    app.get('/stores/notes/:id', isLoggedIn, allowed('access_notes'), (req, res) => {
        fn.getOne(
            m.notes,
            {note_id: req.params.id},
            {include: [fn.users()]}
        )
        .then(note => res.render('stores/notes/show', {note: note}))
        .catch(err => fn.error(err, 'back', req, res));
    });

    //Delete
    app.delete('/stores/notes/:id', isLoggedIn, allowed('notes_delete'), (req, res) => {
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