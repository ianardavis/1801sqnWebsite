module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/notes/new',      isLoggedIn, allowed('note_add'),                   (req, res) => {
        res.render('stores/notes/new', {
            table: req.query.table,
            id:    req.query.id
        });
    });
    app.get('/stores/notes/:id/edit', isLoggedIn, allowed('note_add'),                   (req, res) => {
        db.findOne({
            table: m.notes,
            where: {note_id: req.params.id}
        })
        .then(note => {
            if (note._system) res.error.redirect(new Error('System generated notes can not be edited') , '/', req, res)
            else res.render('stores/notes/edit', {note: note});
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/get/notes',      isLoggedIn, allowed('access_notes', {send: true}), (req, res) => {
        m.notes.findAll({
            where: req.query,
            include: [inc.users()]
        })
        .then(notes => res.send({result: true, notes: notes}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/notes',         isLoggedIn, allowed('note_add',     {send: true}), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        m.notes.create(req.body.note)
        .then(note => res.send({result: true, message: 'Note added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/notes/:id',      isLoggedIn, allowed('note_edit',    {send: true}), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        req.body.note._date = Date.now();
        db.update({
            table: m.notes,
            where: {note_id: req.params.id},
            record: req.body.note
        })
        .then(note => res.send({result: true, message: 'Note saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/notes/:id',   isLoggedIn, allowed('note_delete',  {send: true}), (req, res) => {
        db.findOne({
            table: m.notes,
            where: {note_id: req.params.id}
        })
        .then(note => {
            if (!note._system) {
                db.destroy({
                    table: m.notes,
                    where: {note_id: req.params.id}
                })
                .then(result => res.send({result: true, message: 'Note deleted'}))
                .catch(err =>res.error.send(err, res));
            } else res.error.send('System generated notes can NOT be deleted');
        })
        .catch(err => res.error.send(err, res));
    });
};