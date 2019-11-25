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
    function nullify(item) {
        if (item.group_id === '')   item.group_id   = null;
        if (item.type_id === '')    item.type_id    = null;
        if (item.subtype_id === '') item.subtype_id = null;
        if (item.gender_id === '')  item.gender_id  = null;
        return item;
    };
    
    // Index
    app.get('/stores/items', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, allowed => {
            var whereObj = {};
            if (req.query.category) {whereObj.category_id = req.query.category};
            if (req.query.group)    {whereObj.group_id    = req.query.group};
            if (req.query.type)     {whereObj.type_id     = req.query.type};
            if (req.query.subtype)  {whereObj.subtype_id  = req.query.subtype};
            if (req.query.gender)   {whereObj.gender_id   = req.query.gender};
            fn.getOptions(itemOptions(), req, classes => {
                fn.getAllWhere(
                    m.items,
                    whereObj
                )
                .then(items => {
                    res.render('stores/items/index', {
                        items:   items,
                        classes: classes,
                        query:   whereObj
                    });
                })
                .catch(err => {
                    fn.error(err, '/stores', req, res);
                });
            });
        });
    });

    // New Logic
    app.post('/stores/items', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_add', true, req, res, allowed => {
            req.body.item = nullify(req.body.item);
            fn.create(
                m.items,
                req.body.item
            )
            .then(item => {
                res.redirect('/stores/items/' + item.item_id);
            })
            .catch(err => {
                fn.error(err, '/stores/items', req, res);
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
            fn.getOne(
                m.items,
                {item_id: req.params.id}
            )
            .then(item => {
                fn.getOptions(itemOptions(), req, classes => {
                    res.render('stores/items/edit', {
                        item:    item, 
                        classes: classes
                    });
                });
            })
            .catch(err => {
                fn.error(err, 'stores/items/' + req.params.id, req, res);
            });
        });
    });

    // Put
    app.put('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_edit', true, req, res, allowed => {
            req.body.item = nullify(req.body.item);
            fn.update(
                m.items,
                req.body.item,
                {item_id: req.params.id}
            )
            .then(result => {
                res.redirect('/stores/items/' + req.params.id)
            })
            .catch(err => {
                fn.error(err, '/stores/items/' + req.params.id, req, res);
            });
        });
    });

    // Delete
    app.delete('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_delete', true, req, res, allowed => {
            fn.getOne(
                m.item_sizes,
                {item_id: req.params.id}
            )
            .then(item_sizes => {
                if (!item_sizes) {
                    fn.delete(m.items, {item_id: req.params.id}, req, result => {
                        res.redirect('/stores/items');
                    });
                } else {
                    req.flash('danger', 'Cannot delete item while it has sizes assigned!');
                    res.redirect('/stores/items/' + req.params.id);
                };
            })
            .catch(err => {
                fn.error(err, '/stores/items/' + req.params.id, req, res);
            });
        });
    });

    // Show
    app.get('/stores/items/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, allowed => {
            var query = {};
            query.sn = req.query.sn || 2;
            var include = [
                m.genders, 
                m.categories, 
                m.groups, 
                m.types, 
                m.subtypes,
                fn.item_sizes(true, false, false)
            ];
            fn.getOne(
                m.items,
                {item_id: req.params.id}, 
                include
            )
            .then(item => {
                item.item_sizes.forEach(item_size => {
                    item_size.locationStock = fn.summer(item_size.stocks);
                });
                fn.getNotes('items', req.params.id, req, res)
                .then(notes => {
                    res.render('stores/items/show', {
                        item:  item,
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
};