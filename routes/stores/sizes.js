const   mw = {},
        fn = {};

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // New Logic
    app.post('/stores/sizes', mw.isLoggedIn, allowed('sizes_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.create(
            m.sizes,
            req.body.size
        )
        .then(size => {
            res.redirect('/stores/settings');
        })
        .catch(err => {
            fn.error(err, '/stores/settings', req, res);
        });
    });

    // New Form
    app.get('/stores/sizes/new', mw.isLoggedIn, allowed('sizes_add', true, fn.getOne, m.permissions), (req, res) => {
        res.render('stores/sizes/new');
    });
    // Edit
    app.get('/stores/sizes/:id/edit', mw.isLoggedIn, allowed('sizes_edit', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.params.id}
        )
        .then(size => {
            var query = {};
            query.sn = req.query.sn || 2;
            fn.getNotes('sizes', req.params.id, req, res)
            .then(notes => {
                res.render('stores/sizes/edit', {
                    size:  size,
                    query: query,
                    notes: notes
                });
            });
        })
        .catch(err => {
            fn.error(err, '/stores/settings', req, res);
        });
    });

    // Put
    app.put('/stores/sizes/:id', mw.isLoggedIn, allowed('sizes_edit', true, fn.getOne, m.permissions), (req, res) => {
        fn.update(
            m.sizes,
            req.body.size,
            {size_id: req.params.id}
        )
        .then(result => {
            res.redirect('/stores/settings')
        })
        .catch(err => {
            fn.error(err, '/stores/settings', req, res);
        });
    });

    // Delete
    app.delete('/stores/sizes/:id', mw.isLoggedIn, allowed('sizes_delete', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {size_id: req.params.id}
        )
        .then(size => {
            req.flash('danger', 'Cannot delete size whilst it is assigned to items!');
            res.redirect('/stores/settings');
        })
        .catch(err => {
            fn.delete(
                m.sizes,
                {size_id: req.params.id}
            )
            .then(result => {
                res.redirect('/stores/settings');
            })
            .catch(err => {
                fn.error(err, '/stores/settings', req, res);
            });
        });
    });
};