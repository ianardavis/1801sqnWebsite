const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/nsns', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_add', true, req, res, allowed => {
            fn.create(m.nsns, req.body.nsn, req, nsn => {
                if (nsn) {
                    res.redirect('/stores/item_sizes/' + nsn.stock_id);
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });

    // New Form
    app.get('/stores/nsns/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_add', true, req, res, allowed => {
            fn.getItemSize(req.query.stock_id, req, {include: false}, {include: false}, {include: false}, {include: false}, {include: false}, size => {
                res.render('stores/nsns/new', {
                    size: size
                });
            });
        });
    });

    // Edit
    app.get('/stores/nsns/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_edit', true, req, res, allowed => {
            var query = {};
            query.sn = req.query.sn || 2;
            fn.getNSN(req.params.id, req, (nsn) => {
                if (nsn) {
                    fn.getNotes('nsns', req.params.id, req, res, notes => {
                        res.render('stores/nsns/edit', {
                            nsn:   nsn,
                            notes: notes,
                            query: query
                        });
                    });
                } else {
                    res.redirect('/stores/items');
                }
            });
        });
    });

    // Put
    app.put('/stores/nsns/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_edit', true, req, res, allowed => {
            if (!req.body.nsn._default) req.body.nsn._default = 0;
            fn.update(m.nsns, req.body.nsn, {nsn_id: req.params.id}, req, result => {
                res.redirect('back');
            });
        });
    });

    // Delete
    app.delete('/stores/nsns/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('nsns_delete', true, req, res, allowed => {
            console.log(req.params.id);
            fn.getOne(m.nsns, {nsn_id: req.params.id}, req, nsn => {
                console.log(nsn);
                fn.delete(m.nsns, {nsn_id: req.params.id}, req, result => {
                    res.redirect('/stores/item_sizes/' + nsn.stock_id);
                });
            });
        });
    });
}
