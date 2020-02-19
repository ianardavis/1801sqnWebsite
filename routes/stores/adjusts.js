module.exports = (app, allowed, fn, isLoggedIn, m) => {
    //New Form
    app.get('/stores/adjusts/new', isLoggedIn, allowed('adjusts_add'), (req, res) => {
        if (req.query.adjustType === 'Scrap' || 'Count') {
            if (req.query.stock_id) {
                fn.getOne(
                    m.stock,
                    {stock_id: req.query.stock_id},
                    {include: [{model: m.item_sizes, include: [m.items]}, m.locations]}
                )
                .then(stock => {
                    if (stock) {
                        res.render('stores/adjusts/new', {
                            stock: stock,
                            query: req.query
                        }); 
                    } else {
                        req.flash('danger', 'Stock record not found');
                        res.redirect('/stores/item_sizes/' + req.query.stock_id);
                    };
                })
                .catch(err => fn.error(err, '/stores/item_sizes/' + req.query.stock_id, req, res));
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
        let adjust = req.body.adjust;
        if (adjust) {
            fn.adjustStock(adjust._type, adjust.stock_id, adjust._qty, req.user.user_id)
            .then(result => res.redirect('/stores/stock/' + adjust.stock_id + '/edit'))
            .catch(err => fn.error(err, '/stores/items', req, res));
        } else {
            req.flash('info', 'No adjustment entered!');
            res.redirect('/stores/items');
        };
    });
};