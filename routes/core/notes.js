module.exports = (app, fn) => {
    app.get('/get/notes', fn.loggedIn(), (req, res) => {
        fn.notes.findAll(req.query)
        .then(results => fn.sendRes('notes', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/note',  fn.loggedIn(), (req, res) => {
        fn.notes.find(req.query.where)
        .then(note => res.send({success: true, result: note}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/notes',    fn.loggedIn(), (req, res) => {
        fn.notes.create(
            req.body.note.note,
            req.user.user_id,
            req.body.note.id,
            req.body.note._table,
            false
        )
        .then(note => res.send({success: true, message: 'Note added'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.put('/notes',     fn.loggedIn(), (req, res) => {
        fn.notes.update(req.body.note_id, req.body.note)
        .then(result => res.send({success: true, message: 'Note saved'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.delete('/notes',  fn.loggedIn(), (req, res) => {
        fn.notes.delete(req.body.note_id_delete)
        .then(note => res.send({success: true, message: 'Note deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};