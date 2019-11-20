const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    function itemOptions() {
        return [
            {table: 'categories'}, 
            {table: 'groups', include: m.categories}, 
            {table: 'types', include: m.groups}, 
            {table: 'subtypes', include: m.types}, 
            {table: 'genders'}
        ]
    };
    
    // Index
    app.get('/stores/items', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, allowed => {
            var whereObj = {};
            if (req.query.category) {whereObj.category_id = req.query.category};
            if (req.query.group)    {whereObj.group_id    = req.query.group};
            if (req.query.type)     {whereObj.type_id     = req.query.type};
            if (req.query.subtype)  {whereObj.subtype_id = req.query.subtype};
            if (req.query.gender)   {whereObj.gender_id   = req.query.gender};
            fn.getOptions(itemOptions(), req, classes => {
                fn.getAllWhere(m.items, whereObj, req, items => {
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
        fn.allowed('item_add', true, req, res, allowed => {
            req.body.item = nullify(req.body.item);
            fn.create(m.items, req.body.item, req, item => {
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
        fn.allowed('item_add', true, req, res, allowed => {
            fn.getOptions(itemOptions(), req, classes => {
                res.render('stores/items/new', {
                    classes: classes});
            });
        });
    });
    // Edit
    app.get('/stores/items/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_edit', true, req, res, allowed => {
            fn.getOptions(itemOptions(), req, classes => {
                fn.getOne(m.items, {item_id: req.params.id}, req, item => {
                    if (item) {
                        res.render('stores/items/edit', {
                            item:      item, 
                            classes:   classes
                        });
                    } else {
                        req.flash('danger', 'Error retrieving Item!');
                        res.render('stores/items/' + req.params.id);
                    };
                });
            });
        });
    });

    function nullify(item) {
        if (item.group_id === '')   item.group_id   = null;
        if (item.type_id === '')    item.type_id    = null;
        if (item.subtype_id === '') item.subtype_id = null;
        if (item.gender_id === '')  item.gender_id  = null;
        return item;
    }
    // Put
    app.put('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_edit', true, req, res, allowed => {
            req.body.item = nullify(req.body.item);
            fn.update(m.items, req.body.item, {item_id: req.params.id},req, result => {
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
        fn.allowed('item_delete', true, req, res, allowed => {
            fn.getOne(m.item_sizes, {item_id: req.params.id}, req, item_sizes => {
                if (!item_sizes) {
                    fn.delete(m.items, {item_id: req.params.id}, req, result => {
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
        fn.allowed('access_items', true, req, res, allowed => {
            var query = {};
            query.sn = req.query.sn || 2;
            fn.getItem(req.params.id, true, req, item => {
                if (item) {
                    item.sizes.forEach((size) => {
                        if (size.locations) {
                            size.stock = fn.summer(size.locations);
                        };
                    });
                    fn.getNotes('items', req.params.id, req, res, notes => {
                        res.render('stores/items/show', {
                                item:  item,
                                notes: notes,
                                query: query
                        });
                    });
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });
};