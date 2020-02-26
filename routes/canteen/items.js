const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    //Index
    app.get('/canteen/items', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getAllWhere(m.canteen_items, {item_id: {[op.not]: 0}})
        .then(items => res.render('canteen/items', {items: items}))
        .catch(err => fn.error(err, '/canteen', req, res));
    });
    // New
    app.post('/canteen/items', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.create(
            m.canteen_items,
            req.body.item
        )
        .then(item => {
            req.flash('success', 'Item added');
            res.redirect('/canteen/items');
        })
        .catch(err => fn.error(err, '/canteen/items', req, res));
    });
    // Edit
    app.put('/canteen/items/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.update(
            m.canteen_items,
            req.body.item,
            {item_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Item updated');
            res.redirect('/canteen/items');
        }).catch(err => fn.error(err, '/canteen/items', req, res));
    });
    // Delete
    app.delete('/canteen/items/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        if (Number(req.params.id) !== 0) {
            fn.delete(
                'canteen_items',
                {item_id: req.params.id}
            )
            .then(result => {
                req.flash('success', 'Item deleted');
                res.redirect('/canteen/items');
            })
            .catch(err => fn.error(err, '/canteen/items', req, res));
        } else {
            req.flash('danger', 'This item can not be deleted');
            res.redirect('/canteen/items');
        };
    });
};