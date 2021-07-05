module.exports = (app, m, fn) => {
    app.get('/get/notes',    fn.loggedIn(), fn.permissions.check('access_notes'), (req, res) => {
        m.notes.findAll({
            where:   req.query,
            include: [fn.inc.users.user()]
        })
        .then(notes => res.send({success: true, result: notes}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/note',     fn.loggedIn(), fn.permissions.check('access_notes'), (req, res) => {
        fn.get(
            'notes',
            req.query,
            [fn.inc.users.user()]
        )
        .then(note => res.send({success: true, result: note}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/notes',       fn.loggedIn(), fn.permissions.check('note_add'),     (req, res) => {
        req.body.note.user_id = req.user.user_id;
        m.notes.create(req.body.note)
        .then(note => res.send({success: true, message: 'Note added'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/notes',        fn.loggedIn(), fn.permissions.check('note_edit'),    (req, res) => {
        fn.get(
            'notes',
            {note_id: req.body.note_id}
        )
        .then(note => {
            if (note.system) fn.send_error(res, 'System generated notes can not be edited')
            else {
                return note.update(req.body.note)
                .then(note => res.send({success: true, message: 'Note saved'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/notes/:id', fn.loggedIn(), fn.permissions.check('note_delete'),  (req, res) => {
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