module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/stores/notes/new',      permissions, allowed('note_add'),                   (req, res) => {
        res.render('stores/notes/new', {
            table: req.query.table,
            id:    req.query.id
        });
    });
    app.get('/stores/notes/:id/edit', permissions, allowed('note_add'),                   (req, res) => {
        m.notes.findOne({
            where: {note_id: req.params.id, _system: 0},
            attributes: ['note_id']
        })
        .then(note => res.render('stores/notes/edit'))
        .catch(err => res.error.redirect(err, req, res));
    });

    app.get('/stores/get/notes',      permissions, allowed('access_notes', {send: true}), (req, res) => {
        m.notes.findAll({
            where:   req.query,
            include: [inc.users()]
        })
        .then(notes => res.send({result: true, notes: notes}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/notes',         permissions, allowed('note_add',     {send: true}), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        m.notes.create(req.body.note)
        .then(note => res.send({result: true, message: 'Note added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/notes/:id',      permissions, allowed('note_edit',    {send: true}), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        req.body.note._date = Date.now();
        m.notes.update(
            req.body.note,
            {where: {note_id: req.params.id}}
        )
        .then(note => res.send({result: true, message: 'Note saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/notes/:id',   permissions, allowed('note_delete',  {send: true}), (req, res) => {
        m.notes.destroy({
            where: {
                note_id: req.params.id,
                _system: 0
            }
        })
        .then(result => res.send({result: true, message: 'Note deleted'}))
        .catch(err => res.error.send(err, res));
    });
    };