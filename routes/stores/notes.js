const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");
        
module.exports = (app, m) => { 
    //New
    app.get('/stores/notes/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('notes_add', true, req, res, (allowed) => {
            res.render('stores/notes/new', {
                link: {
                    table:  req.query.table,
                    id:     req.query.id
                },
            });
        });
    });
    //New logic
    app.post('/stores/notes', mw.isLoggedIn, (req, res) => {
        fn.allowed('notes_add', true, req, res, (allowed) => {
            req.body.note.user_id = req.user.user_id;
            fn.create(m.notes, req.body.note, req, (note) => {
                if (note) {
                    res.redirect('/stores/' + note._table + '/' + note._id);
                } else {
                    res.redirect('back');
                };
            });
        });
    });

    //Edit
    app.get('/stores/notes/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('notes_add', true, req, res, (allowed) => {
            fn.getOne(m.notes, {note_id: req.params.id}, req, (note) => {
                res.render('stores/notes/edit', {
                    note: note
                })
            })
        });
    })
    
    //Delete
    app.delete('/stores/notes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('notes_delete', true, req, res, (allowed) => {
            fn.delete(m.notes, {note_id: req.params.id}, req, (result) => {
                res.redirect('back');
            });
        });
    })

    //Show
    app.get('/stores/notes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_notes', true, req, res, (allowed) => {
            fn.getOne(m.notes, {note_id: req.params.id}, req, (note => {
                fn.getUser(note.user_id, {include: false}, req, (user => {   
                    res.render('stores/notes/show', {
                        note: note,
                        user: user
                    });
                }))
            }));
        });
    })
}