const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // Index
    app.get('/stores/items', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', res, (allowed) => {
            if (allowed) {
                var whereObj = {};
                if (req.query.category) {whereObj._category = req.query.category};
                if (req.query.group)    {whereObj._group    = req.query.group};
                if (req.query.type)     {whereObj._type     = req.query.type};
                if (req.query.subtype)  {whereObj._sub_type = req.query.subtype};
                if (req.query.gender)   {whereObj._gender   = req.query.gender};
                fn.getAllItemClasses(req, res, (classes) => {
                    m.items.findAll({
                        attributes: ['item_id', '_description'],
                        where:      whereObj
                    }).then((items_list) => {
                        res.render('stores/items/index', {items: items_list,
                            classes: classes,
                            query:   whereObj});
                    }).catch((err) => {
                        req.flash('danger', 'Error loading items!')
                        console.log(err);
                        res.redirect('/stores');
                    });
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores');
            }            
        });
    });

    // New Logic
    app.post('/stores/items', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_add', res, (allowed) => {
            if (allowed) {
                m.items.create(req.body.item
                ).then((item) => {
                    req.flash('success', 'Item added!');
                    res.redirect('/stores/items/' + item.item_id);
                }).catch((err) => {
                    req.flash('danger', 'Error adding new item!')
                    console.log(err);
                    res.redirect('/stores/items');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items');
            }
        });
    });

    // New Form
    app.get('/stores/items/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_add', res, (allowed) => {
            if (allowed) {
                fn.getAllItemClasses(req, res, (classes) => {
                    res.render('stores/items/new', {
                        classes: classes});
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items');
            }
        });
    });

    // Edit
    app.get('/stores/items/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_edit', res, (allowed) => {
            if (allowed) {
                fn.getAllItemClasses(req, res, (classes) => {
                    fn.getAll(m.suppliers, req, res, true, (suppliers) => {
                        m.items.findOne({
                            where: {
                                item_id: req.params.id
                            }
                        }).then((item) => {
                            if (!item) {
                                req.flash('danger', 'Error retrieving Item!');
                                res.render('stores/items/' + req.params.id);
                            } else {
                                res.render('stores/items/edit', {
                                    item:      item, 
                                    classes:   classes,
                                    suppliers: suppliers
                                });
                            }
                        }).catch((err) => {
                            req.flash('danger', 'Error retrieving item!');
                            console.log(err);
                            res.redirect('stores/items/' + req.params.id);
                        });
                    });
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items');
            }
        });
    });

    // Put
    app.put('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_edit', res, (allowed) => {
            if (allowed) {
                m.items.update(
                    req.body.item,
                    {
                        where: {item_id: req.params.id}
                    }
                ).then((item) => {
                    req.flash('success', 'Item edited!');
                    res.redirect('/stores/items/' + req.params.id)
                }).catch((err) => {
                    req.flash('danger', 'Error editing item!');
                    console.log(err);
                    res.redirect('/stores/items/' + req.params.id);            
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items');
            }
        });
    });

    // Delete
    app.delete('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_delete', res, (allowed) => {
            fn.getOne(m.items_sizes, req, res, {item_id: req.params.id}, (item_sizes) => {
                if (!item_sizes) {
                    fn.delete(allowed, m.items, {item_id: req.params.id}, req, (result) => {
                        res.redirect('/stores/items');
                    });
                } else {
                    req.flash('danger', 'Cannot delete item while it has sizes assigned!');
                    res.redirect('/stores/items/' + req.params.id);
                }
            })
        });
    });

    // Show
    app.get('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', res, (allowed) => {
            if (allowed) {
                m.items.findOne({
                    where: {
                        item_id: req.params.id
                    },
                    include: [
                        m.genders, 
                        m.categories, 
                        m.groups, 
                        m.types, 
                        m.subtypes, 
                        m.suppliers,
                        {model: m.items_sizes, as: 'sizes', include: [m.sizes]}
                    ]
                }).then((item) => {
                    if (!item) {
                        req.flash('danger', 'Item not found!');
                        res.redirect('/stores/items');
                    } else {
                        fn.getNotes('items', req.params.id,req, (notes) => {
                            res.render('stores/items/show', {
                                    item:   item,
                                    notes:  notes
                            });
                        });
                    };
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores');
            }
        });
    });
}