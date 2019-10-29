const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");
        
module.exports = (app, m) => { 
    //New
    app.get('/stores/notes/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('notes_add', res, (allowed) => {
            if (allowed) {
                res.render('stores/notes/new', {
                    link: {
                        table:  req.query.table,
                        id:     req.query.id
                    },
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items/' + req.params.id);
            }
        });
    });
    //New logic
    app.post('/stores/notes', mw.isLoggedIn, (req, res) => {
        fn.allowed('notes_add', res, (allowed) => {
            if (allowed) {
                req.body.note.user_id = req.user.user_id;
                m.notes.create(req.body.note
                    ).then((note) => {
                        req.flash('success', 'Note added');
                        res.redirect('/stores/' + note._link_table + '/' + note._link_id);
                    }).catch((err) => {
                        req.flash('danger', 'Error adding note!')
                        console.log(err);
                        res.redirect('/stores');
                    });
            } else {
                req.flash('danger', 'permission denied');
                res.redirect('back');
            }
        });
    });

    //Edit
    app.get('/stores/notes/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('notes_add', res, (allowed) => {
            if (allowed) {
                fn.getOne(m.notes, req, res, {note_id: req.params.id}, (note) => {
                    res.render('stores/notes/edit', {
                        note: note
                    })
                })
            } else {
                req.flash('danger', 'permission denied');
                res.redirect('/stores/notes/' + req.para.id);
            }
        });
    })
    
    //Delete
    app.delete('/stores/notes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('notes_delete', res, (allowed) => {
            fn.delete(allowed, m.notes, {note_id: req.params.id}, req, (result) => {
                res.redirect('back');
            });
        });
    })

    //Show
    app.get('/stores/notes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_notes', res, (allowed) => {
            if (allowed) {
                fn.getOne(m.notes, req, res, {note_id: req.params.id}, (note => {
                    fn.getOne(m.users, req, res, {user_id: note.user_id}, (user => {   
                        res.render('stores/notes/show', {
                            note: note,
                            user: user
                        });
                    }))
                }));
            } else {
                req.flash('danger', 'permission denied');
                res.redirect('back');
            }
        });
    })
}