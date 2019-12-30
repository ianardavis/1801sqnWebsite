module.exports = (app, allowed, fn, isLoggedIn, m) => {
    //New Form
    app.get('/stores/adjusts/new', isLoggedIn, allowed('adjusts_add'), (req, res) => {
        if (req.query.at === 'Scrap' || 'Count') {
            if (req.query.si) {
                fn.getOne(
                    m.stock,
                    {stock_id: req.query.si},
                    {include: fn.item_sizes(false, true), attributes: null, nullOK: false}
                )
                .then(stock => {
                    if (stock) {
                        res.render('stores/adjusts/new', {
                            stock: stock,
                            query:    req.query
                        }); 
                    } else {
                        req.flash('danger', 'Stock record not found');
                        res.redirect('/stores/item_sizes/' + req.query.si);
                    };
                })
                .catch(err => fn.error(err, '/stores/item_sizes/' + req.query.si, req, res));
            } else {
                req.flash('danger', 'No item specified');
                res.redirect('/stores/items');
            };
        } else {
            req.flash('danger', 'Invalid request');
            res.redirect('/stores/items');
        };
    });
    //New Logic
    app.post('/stores/adjusts', isLoggedIn, allowed('adjusts_add'), (req, res) => {
        var adjust = req.body.adjust;
        if (adjust) {
            adjust._date = Date.now();
            adjust.user_id = req.user.user_id;
            fn.getOne(
                m.stock,
                {stock_id: adjust.stock_id}
            )
            .then(stock => {
                adjust._qty_difference = adjust._qty - stock._qty;
                fn.create(
                    m.adjusts,
                    adjust
                )
                .then(newAdjust => {
                    if (adjust._type === 'Count') {
                        fn.update(
                            m.stock,
                            {_qty: newAdjust._qty},
                            {stock_id: newAdjust.stock_id}
                        )
                        .then(result => {
                            if (result) req.flash('success', 'Adjustment made');
                            res.redirect('/stores/stock/' + newAdjust.stock_id + '/edit');
                        })
                        .catch(err => {
                            req.flash('danger', err.message);
                            res.redirect('/stores/stock/' + newAdjust.stock_id + '/edit');
                        });
                    } else if (adjust._type === 'Scrap'){
                        fn.subtractStock(
                            newAdjust.stock_id,
                            newAdjust._qty
                        )
                        .then(result => {
                            if (result) req.flash('success', 'Adjustment made');
                            res.redirect('/stores/stock/' + newAdjust.stock_id + '/edit');
                        })
                        .catch(err => fn.error(err, '/stores/stock/' + newAdjust.stock_id + '/edit', req, res));
                    };
                })
                .catch(err => fn.error(err, '/stores', req, res));
            })
            .catch(err => fn.error(err, '/stores', req, res));
        } else {
            req.flash('info', 'No adjustment entered!');
            res.redirect('/stores/items');
        };
    });
};