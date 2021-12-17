module.exports = (app, m, fn) => {
    app.get('/get/notes',    fn.loggedIn(), (req, res) => {
        m.notes.findAll({
            where:   req.query.where,
            include: [fn.inc.users.user()],
            ...fn.pagination(req.query)
        })
        .then(notes => res.send({success: true, result: notes}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/note',     fn.loggedIn(), (req, res) => {
        fn.get(
            'notes',
            req.query.where,
            [fn.inc.users.user()]
        )
        .then(note => res.send({success: true, result: note}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/notes',       fn.loggedIn(), (req, res) => {
        fn.notes.create(
            req.body.note.note,
            req.user.user_id,
            req.body.note.id,
            req.body.note._table,
            false
        )
        .then(note => res.send({success: true, message: 'Note added'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/notes',        fn.loggedIn(), (req, res) => {
        fn.get(
            'notes',
            {note_id: req.body.note_id}
        )
        .then(note => {
            if (note.system) fn.send_error(res, 'System generated notes can not be edited')
            else {
                return fn.update(note, req.body.note)
                .then(note => res.send({success: true, message: 'Note saved'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/notes/:id', fn.loggedIn(), (req, res) => {
        fn.get(
            'notes',
            {note_id: req.params.id}
        )
        .then(note => {
            if (note.system) fn.send_error(res, 'System generated notes can not be deleted')
            else {
                return note.destroy()
                .then(result => res.send({success: true, message: 'Note deleted'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};