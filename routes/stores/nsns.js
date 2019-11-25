const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/nsns', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_add', true, req, res, allowed => {
            fn.create(
                m.nsns,
                req.body.nsn
            )
            .then(nsn => {
                res.redirect('/stores/item_sizes/' + nsn.itemsize_id);
            })
            .catch(err => {
                fn.error(err, '/stores/items/' + req.body.nsn.itemsize_id, req, res);
            });
        });
    });

    // New Form
    app.get('/stores/nsns/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_add', true, req, res, allowed => {
            fn.getOne(
                m.item_sizes,
                {itemsize_id: req.query.itemsize_id},
                fn.itemSizeInclude(
                    {include: false}, 
                    {include: false}, 
                    {include: false}, 
                    {include: false}, 
                    {include: false}
                )
            )
            .then(itemsize => {
                res.render('stores/nsns/new', {
                    itemsize: itemsize
                });
            })
            .catch(err => {
                fn.error(err, '/stores/item_sizes/' + req.query.itemsize_id, req, res);
            });
        });
    });

    // Edit
    app.get('/stores/nsns/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_edit', true, req, res, allowed => {
            var query = {};
            query.sn = req.query.sn || 2;
            fn.getOne(
                m.nsns,
                {nsn_id: req.params.id},
                [{model: m.item_sizes, include: [m.items, m.sizes]}]
            )
            .then(nsn => {
                fn.getNotes('nsns', req.params.id, req, res)
                .then(notes => {
                    res.render('stores/nsns/edit', {
                        nsn:   nsn,
                        notes: notes,
                        query: query
                    });
                });
            })
            .catch(err => {
                fn.error(err, '/stores/items', req, res);
            });
        });
    });

    // Put
    app.put('/stores/nsns/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_edit', true, req, res, allowed => {
            if (!req.body.nsn._default) req.body.nsn._default = 0;
            fn.update(
                m.nsns,
                req.body.nsn,
                {nsn_id: req.params.id}
            )
            .then(result => {
                res.redirect('back');
            })
            .catch(err => {
                fn.error(err, 'back', req, res);
            });
        });
    });

    // Delete
    app.delete('/stores/nsns/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_delete', true, req, res, allowed => {
            fn.delete(
                m.nsns, 
                {nsn_id: req.params.id}
            )
            .then(result => {
                res.redirect('/stores/item_sizes/' + nsn.itemsize_id);
            })
            .catch(err => {
                fn.error(err, '/stores/items', req, res);
            });
        });
    });
}
