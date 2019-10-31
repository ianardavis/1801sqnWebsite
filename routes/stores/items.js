const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // Index
    app.get('/stores/items', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, (allowed) => {
            var whereObj = {};
            if (req.query.category) {whereObj.category_id = req.query.category};
            if (req.query.group)    {whereObj.group_id    = req.query.group};
            if (req.query.type)     {whereObj.type_id     = req.query.type};
            if (req.query.subtype)  {whereObj.sub_type_id = req.query.subtype};
            if (req.query.gender)   {whereObj.gender_id   = req.query.gender};
            fn.getAllItemClasses(req, (classes) => {
                fn.getAllWhere(m.items, whereObj, req, (items) => {
                    res.render('stores/items/index', {
                        items:   items,
                        classes: classes,
                        query:   whereObj
                    });
                });
            });
        });
    });

    // New Logic
    app.post('/stores/items', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_add', true, req, res, (allowed) => {
            fn.create(m.items, req.body.item, req, (item) => {
                if (item) {
                    res.redirect('/stores/items/' + item.item_id);
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });

    // New Form
    app.get('/stores/items/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_add', true, req, res, (allowed) => {
            fn.getAllItemClasses(req, res, (classes) => {
                res.render('stores/items/new', {
                    classes: classes});
            });
        });
    });

    // Edit
    app.get('/stores/items/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_edit', true, req, res, (allowed) => {
            fn.getAllItemClasses(req, res, (classes) => {
                fn.getAll(m.suppliers, req, true, (suppliers) => {
                    fn.getOne(m.items, {item_id: req.params.id}, req, (item) => {
                        if (item) {
                            res.render('stores/items/edit', {
                                item:      item, 
                                classes:   classes,
                                suppliers: suppliers
                            });
                        } else {
                            req.flash('danger', 'Error retrieving Item!');
                            res.render('stores/items/' + req.params.id);
                        };
                    });
                });
            });
        });
    });

    // Put
    app.put('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_edit', true, req, res, (allowed) => {
            fn.update(m.items, req.body.item, {item_id: req.params.id},req, (result) => {
                if (result) {
                    res.redirect('/stores/items/' + req.params.id)
                } else {
                    res.redirect('/stores/items/' + req.params.id);
                };
            });
        });
    });

    // Delete
    app.delete('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_delete', true, req, res, (allowed) => {
            fn.getOne(m.items_sizes, {item_id: req.params.id}, req, (item_sizes) => {
                if (!item_sizes) {
                    fn.delete(m.items, {item_id: req.params.id}, req, (result) => {
                        res.redirect('/stores/items');
                    });
                } else {
                    req.flash('danger', 'Cannot delete item while it has sizes assigned!');
                    res.redirect('/stores/items/' + req.params.id);
                };
            });
        });
    });

    // Show
    app.get('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, (allowed) => {
            fn.getItem(req.params.id, true, req, (item) => {
                if (item) {
                    fn.getNotes('items', req.params.id,req, (notes) => {
                        res.render('stores/items/show', {
                                item:   item,
                                notes:  notes
                        });
                    });
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });
};