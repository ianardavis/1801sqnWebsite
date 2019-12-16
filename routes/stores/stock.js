const   mw = {},
        fn = {};

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // New Logic
    app.post('/stores/stock', mw.isLoggedIn, allowed('stock_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.locations,
            {_location: req.body.location._location}
        )
        .then(location => {
            req.body.stock.location_id = location.location_id;
            createStock(req.body.stock, req, res);
        })
        .catch(err => {
            fn.create(
                m.locations,
                {_location: req.body.location._location}
            )
            .then(location => {
                req.body.stock.location_id = location.location_id;
                createStock(req.body.stock, req, res);
            })
            .catch(err => {
                fn.error(err, '/stores/items', req, res);
            })
        });
    });
    function createStock(stock, req, res) {
        fn.create(
            m.stock,
            stock
        )
        .then(stock => {
            res.redirect('/stores/item_sizes/' + stock.itemsize_id);
        })
        .catch(err => {
            fn.error(err, '/stores/items', req, res);
        });;
    };

    // New Form
    app.get('/stores/stock/new', mw.isLoggedIn, allowed('stock_add', true, fn.getOne, m.permissions), (req, res) => {
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
        .then(item => {
            res.render('stores/stock/new', {
                item: item,
            });
        })
        .catch(err => {
            fn.error(err, '/stores/items', req, res);
        });
    });

    // Edit
    app.get('/stores/stock/:id/edit', mw.isLoggedIn, allowed('stock_edit', true, fn.getOne, m.permissions), (req, res) => {
        var query = {};
        query.sn = req.query.sn || 2;
        fn.getOne(
            m.stock,
            {stock_id: req.params.id},
            [
                {model: m.item_sizes, include: [m.items, m.sizes]},
                m.locations
            ]
        )
        .then(stock => {
            fn.getNotes('stock', req.params.id, req, res)
            .then(notes => {
                res.render('stores/stock/edit', {
                    stock: stock,
                    notes: notes,
                    query: query
                });
            });
        })
        .catch(err => {
            fn.error(err, '/stores/items', req, res);
        });
    });

    // Put
    app.put('/stores/stock/:id', mw.isLoggedIn, allowed('stock_edit', true, fn.getOne, m.permissions), (req, res) => {
        fn.update(
            m.stock,
            req.body.stock,
            {stock_id: req.params.id}
        )
        .then(result => {
            res.redirect('back'); 
        })
        .catch(err => {
            fn.error(err, 'back', req, res);
        });
    });

    // Delete
    app.delete('/stores/stock/:id', mw.isLoggedIn, allowed('stock_delete', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.stock,
            {stock_id: req.params.id}
        )
        .then(stock => {
            if (stock._qty === 0) {
                fn.delete(
                    m.stock,
                    {stock_id: req.params.id}
                )
                .then(result => {
                    res.redirect('/stores/item_sizes/' + stock.itemsize_id);
                })
                .catch(err => {
                    fn.error(err, '/stores/items', req, res);
                });
            } else {
                req.flash('danger', 'Cannot delete stock!');
                res.redirect('/stores/item_sizes/' + stock.itemsize_id);
            };
        })
        .catch(err => {
            fn.error(err, '/stores/items', req, res);
        });
    });
}