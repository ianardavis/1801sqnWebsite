module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //NEW
    app.get('/stores/notes/new',      isLoggedIn, allowed('note_add'),                   (req, res) => {
        res.render('stores/notes/new', {
            table: req.query.table,
            id:    req.query.id
        });
    });
    //EDIT
    app.get('/stores/notes/:id/edit', isLoggedIn, allowed('note_add'),                   (req, res) => {
        fn.getOne(
            m.notes,
            {note_id: req.params.id}
        )
        .then(note => {
            if (note._system) {
                fn.error(new Error('System notes can not be edited') , '/', req, res)
            } else res.render('stores/notes/edit', {note: note});
        })
        .catch(err => fn.error(err, '/', req, res));
    });
    //ASYNC GET
    app.get('/stores/getnotes',       isLoggedIn, allowed('access_notes', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.notes,
            req.query,
            {include: [inc.users()]}
        )
        .then(notes => res.send({result: true, notes: notes}))
        .catch(err => fn.send_error(err, res));
    });

    //POST
    app.post('/stores/notes',         isLoggedIn, allowed('note_add',     {send: true}), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        fn.create(m.notes, req.body.note)
        .then(note => res.send({result: true, message: 'Note added'}))
        .catch(err => res.send({result: false, error: err.message}));
    });

    //PUT
    app.put('/stores/notes/:id',      isLoggedIn, allowed('note_edit',    {send: true}), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        req.body.note._date = Date.now();
        fn.update(
            m.notes,
            req.body.note,
            {note_id: req.params.id}
        )
        .then(note => res.send({result: true, message: 'Note saved'}))
        .catch(err => res.send({result: false, error: err.message}));
    });
    
    //DELETE
    app.delete('/stores/notes/:id',   isLoggedIn, allowed('note_delete',  {send: true}), (req, res) => {
        fn.getOne(
            m.notes,
            {note_id: req.params.id}
        )
        .then(note => {
            if (!note._system) {
                fn.delete(
                    m.notes,
                    {note_id: req.params.id}
                )
                .then(result => res.send({result: true, message: 'Note deleted'}))
                .catch(err =>fn.send_error(err, res));
            } else fn.send_error('System generated notes can NOT be deleted');
        })
        .catch(err => fn.send_error(err, res));
    });
};