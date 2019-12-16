const fn = {},
      mw = {};
        
module.exports = (app, m, allowed) => { 
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    //New
    app.get('/stores/notes/new', mw.isLoggedIn, allowed('notes_add', true, fn.getOne, m.permissions), (req, res) => {
        res.render('stores/notes/new', {
            link: {
                table:  req.query.table,
                id:     req.query.id
            },
        });
    });
    //New logic
    app.post('/stores/notes', mw.isLoggedIn, allowed('notes_add', true, fn.getOne, m.permissions), (req, res) => {
        req.body.note.user_id = req.user.user_id;
        fn.create(
            m.notes,
            req.body.note
        )
        .then(note => {
            res.redirect('/stores/' + note._table + '/' + note._id);
        })
        .catch(err => {
            fn.error(err, 'back', req, res);
        });
    });

    //Edit
    app.get('/stores/notes/:id/edit', mw.isLoggedIn, allowed('notes_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.notes,
            {note_id: req.params.id}
        )
        .then(note => {
            res.render('stores/notes/edit', {
                note: note
            })
        })
        .catch(err => {
            fn.error(err, 'back', req, res);
        });
    })
    
    //Delete
    app.delete('/stores/notes/:id', mw.isLoggedIn, allowed('notes_delete', true, fn.getOne, m.permissions), (req, res) => {
        fn.delete(
            m.notes,
            {note_id: req.params.id}
        )
        .then(result => {
            res.redirect('back');
        })
        .catch(err => {
            fn.error(err, 'back', req, res);
        });
    })

    //Show
    app.get('/stores/notes/:id', mw.isLoggedIn, allowed('access_notes', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.notes,
            {note_id: req.params.id},
            [{model: m.users, include: [m.ranks]}]
        )
        .then(note => {
            res.render('stores/notes/show', {
                note: note,
                user: user
            });
        })
        .catch(err => {
            fn.error(err, 'back', req, res);
        });
    })
}