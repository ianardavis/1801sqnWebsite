const   mw = {},
        fn = {};

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
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
    app.get('/stores/items', mw.isLoggedIn, allowed('access_items', true, fn.getOne, m.permissions), (req, res) => {
        var query = {},
            where = {};
        query.cat = Number(req.query.cat) || -1;
        query.grp = Number(req.query.grp) || -1;
        query.typ = Number(req.query.typ) || -1;
        query.sub = Number(req.query.sub) || -1;
        query.gen = Number(req.query.gen) || -1;
        if (query.cat !== -1) where.category_id = query.cat;
        if (query.grp !== -1) where.group_id    = query.grp;
        if (query.typ !== -1) where.type_id     = query.typ;
        if (query.sub !== -1) where.subtype_id  = query.sub;
        if (query.gen !== -1) where.gender_id   = query.gen;
        fn.getOptions(itemOptions(), req, classes => {
            fn.getAllWhere(
                m.items,
                where
            )
            .then(items => {
                res.render('stores/items/index', {
                    items:   items,
                    classes: classes,
                    query:   query
                });
            })
            .catch(err => {
                fn.error(err, '/stores', req, res);
            });
        });
    });

    // New Logic
    app.post('/stores/items', mw.isLoggedIn, allowed('item_add', true, fn.getOne, m.permissions), (req, res) => {
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

    // New Form
    app.get('/stores/items/new', mw.isLoggedIn, allowed('item_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOptions(itemOptions(), req, classes => {
            res.render('stores/items/new', {
                classes: classes});
        });
    });
    // Edit
    app.get('/stores/items/:id/edit', mw.isLoggedIn, allowed('item_edit', true, fn.getOne, m.permissions), (req, res) => {
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

    // Put
    app.put('/stores/items/:id', mw.isLoggedIn, allowed('item_edit', true, fn.getOne, m.permissions), (req, res) => {
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

    // Delete
    app.delete('/stores/items/:id', mw.isLoggedIn, allowed('item_delete', true, fn.getOne, m.permissions), (req, res) => {
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

    // Show
    app.get('/stores/items/:id', mw.isLoggedIn, allowed('access_items', true, fn.getOne, m.permissions), (req, res) => {
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
};