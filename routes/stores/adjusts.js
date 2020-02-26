module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //New Form
    app.get('/stores/adjusts/new', isLoggedIn, allowed('adjust_add'), (req, res) => {
        if (req.query.adjustType === 'Scrap' || 'Count') {
            if (req.query.stock_id) {
                fn.getOne(
                    m.stock,
                    {stock_id: req.query.stock_id},
                    {include: [
                        inc.sizes(),
                        m.locations
                    ]}
                )
                .then(stock => {
                    res.render('stores/adjusts/new', {
                        stock: stock,
                        query: req.query
                    });
                })
                .catch(err => fn.error(err, '/stores/sizes/' + req.query.stock_id, req, res));
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
    app.post('/stores/adjusts', isLoggedIn, allowed('adjust_add'), (req, res) => {
        if (req.body.adjust) {
            let adjust = req.body.adjust;
            fn.adjustStock(
                adjust._type,
                adjust.stock_id,
                adjust._qty,
                req.user.user_id
            )
            .then(result => {
                req.flash('success', 'Adjustment made')
                res.redirect('/stores/stock/' + adjust.stock_id + '/edit');
            })
            .catch(err => fn.error(err, '/stores/items', req, res));
        } else {
            req.flash('info', 'No adjustment entered!');
            res.redirect('/stores/items');
        };
    });
};