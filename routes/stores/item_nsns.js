const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/item_nsns', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_nsn_add', true, req, res, (allowed) => {
            fn.create(m.item_nsns, req.body.nsn, req, (nsn) => {
                if (nsn) {
                    res.redirect('/stores/item_sizes/' + nsn.stock_id);
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });

    // New Form
    app.get('/stores/item_nsns/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_nsn_add', true, req, res, (allowed) => {
            fn.getItemSize(req.query.stock_id, req, false, false, false, false, (size) => {
                res.render('stores/item_nsns/new', {
                    size: size
                });
            });
        });
    });

    // Edit
    app.get('/stores/item_nsns/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_nsn_edit', true, req, res, (allowed) => {
            fn.getNSN(req.params.id, req, (nsn) => {
                if (nsn) {
                    fn.getNotes('item_nsns', req.params.id, req, res, (notes) => {
                        res.render('stores/item_nsns/edit', {
                            nsn:   nsn,
                            notes: notes
                        });
                    });
                } else {
                    res.redirect('/stores/items');
                }
            });
        });
    });

    // Put
    app.put('/stores/item_nsns/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_nsn_edit', true, req, res, (allowed) => {
            fn.update(m.item_nsns, req.body.nsn, req.params.id, req, (result) => {
                res.redirect('back');
            });
        });
    });

    // Delete
    app.delete('/stores/item_nsns/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_nsn_delete', true, req, res, (allowed) => {
            fn.getOne(m.item_locations,req, {nsn_id: req.params.id}, (nsn) => {
                fn.delete(m.item_nsns, {nsn_id: req.params.id}, req, (result) => {
                    res.redirect('/stores/item_sizes/' + nsn.stock_id);
                });
            });
        });
    });
}
