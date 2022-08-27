module.exports = (app, m, fn) => {
    app.get('/get/notes',    fn.loggedIn(), (req, res) => {
        m.notes.findAndCountAll({
            where:   req.query.where,
            include: [fn.inc.users.user()],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('notes', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/note',     fn.loggedIn(), (req, res) => {
        m.notes.findOne({
            where: req.query.where,
            include: [fn.inc.users.user()]
        })
        .then(note => {
            if (note) res.send({success: true, result: note})
            else res.send({success: false, message: 'Note not found'});
        })
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
        fn.notes.get(req.body.note_id)
        .then(note => {
            if (note.system) fn.send_error(res, 'System generated notes can not be edited')
            else {
                fn.update(note, req.body.note)
                .then(note => res.send({success: true, message: 'Note saved'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/notes/:id', fn.loggedIn(), (req, res) => {
        fn.notes.get(req.params.id)
        .then(note => {
            if (note.system) fn.send_error(res, 'System generated notes can not be deleted')
            else {
                note.destroy()
                .then(result => res.send({success: true, message: 'Note deleted'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};