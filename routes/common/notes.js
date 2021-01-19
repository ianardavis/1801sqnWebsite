module.exports = (app, allowed, inc, permissions, m, db) => {
    app.get(`/${db}/get/notes`,    permissions, allowed('access_notes', {send: true}), (req, res) => {
        m.notes.findAll({
            where:   req.query,
            include: [inc.users()]
        })
        .then(notes => res.send({success: true, result: notes}))
        .catch(err => res.error.send(err, res));
    });
    app.get(`/${db}/get/note`,     permissions, allowed('access_notes', {send: true}), (req, res) => {
        m.notes.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(note => res.send({success: true, result: note}))
        .catch(err => res.error.send(err, res));
    });

    app.post(`/${db}/notes`,       permissions, allowed('note_add',     {send: true}), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        m.notes.create(req.body.note)
        .then(note => res.send({success: true, message: 'Note added'}))
        .catch(err => res.error.send(err, res));
    });
    
    app.put(`/${db}/notes`,        permissions, allowed('note_edit',    {send: true}), (req, res) => {
        m.notes.findOne({
            where: {note_id: req.body.note_id},
            attributes: ['note_id', '_system']
        })
        .then(note => {
            if     (!note)               res.send({success: false, message: 'Note not found'})
            else if (note._system === 1) res.send({success: false, message: 'System generated notes can not be edited'})
            else {
                return note.update(req.body.note)
                .then(note => res.send({success: true, message: 'Note saved'}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.delete(`/${db}/notes/:id`, permissions, allowed('note_delete',  {send: true}), (req, res) => {
        m.notes.findOne({
            where: {note_id: req.params.id},
            attributes: ['note_id', '_system']
        })
        .then(note => {
            if      (!note)              res.send({success: false, message: 'Note not found'})
            else if (note._system === 1) res.send({success: false, message: 'System generated notes can not be deleted'})
            else {
                return note.destroy()
                .then(result => res.send({success: true, message: 'Note deleted'}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};