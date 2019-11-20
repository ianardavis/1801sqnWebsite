const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/sizes', mw.isLoggedIn, (req, res) => {
        fn.allowed('sizes_add', true, req, res, allowed => {
            fn.create(m.sizes, req.body.size, req, size => {
                res.redirect('/stores/settings');
            });
        });
    });

    // New Form
    app.get('/stores/sizes/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('sizes_add', true, req, res, allowed => {
            res.render('stores/sizes/new');
        });
    });
    // Edit
    app.get('/stores/sizes/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('sizes_edit', true, req, res, allowed => {
            fn.getOne(m.sizes, {size_id: req.params.id}, req, size => {
                if (size) {
                    var query = {};
                    query.sn = req.query.sn || 2;
                    fn.getNotes('sizes', req.params.id, req, res, notes => {
                        res.render('stores/sizes/edit', {
                            size:  size,
                            query: query,
                            notes: notes
                        });
                    });
                } else {
                    req.flash('danger', 'Error retrieving size!');
                    res.redirect('back');
                };
            });
        });
    });

    // Put
    app.put('/stores/sizes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('sizes_edit', true, req, res, allowed => {
            fn.update(m.sizes, req.body.size, {size_id: req.params.id}, req, result => {
                res.redirect('/stores/settings')
            });
        });
    });

    // Delete
    app.delete('/stores/sizes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('sizes_delete', true, req, res, allowed => {
            fn.getOne(m.item_sizes, {size_id: req.params.id}, req, size => {
                if (!size) {
                    fn.delete(m.sizes, {size_id: req.params.id}, req, result => {
                        res.redirect('back');
                    });
                } else {
                    req.flash('danger', 'Cannot delete size whilst it is assigned to items!');
                    res.redirect('back');
                };
            });
        });
    });
};