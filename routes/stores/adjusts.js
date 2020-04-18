module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //NEW
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
    //ASYNC GET
    app.get('/stores/getadjusts', isLoggedIn, allowed('access_adjusts', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.adjusts,
            req.query,
            {include: [
                inc.users(), 
                inc.stock({as: 'stock'})
        ]})
        .then(adjusts => res.send({result: true, adjusts: adjusts}))
        .catch(err => fn.send_error(err.message, res));
    });
    //ASYNC GET
    app.get('/stores/getadjustsbysize', isLoggedIn, allowed('access_adjusts', {send: true}), (req, res) => {
        fn.getAll(
            m.adjusts,
            [
                inc.users(), 
                inc.stock({
                    as: 'stock',
                    where: req.query,
                    required: true
        })])
        .then(adjusts => res.send({result: true, adjusts: adjusts}))
        .catch(err => fn.send_error(err.message, res));
    });

    //POST
    app.post('/stores/adjusts', isLoggedIn, allowed('adjust_add', {send: true}), (req, res) => {
        if (req.body.adjust) {
            let adjust = req.body.adjust;
            fn.adjustStock(
                adjust._type,
                adjust.stock_id,
                adjust._qty,
                req.user.user_id
            )
            .then(result => res.send({result: true, message: 'Adjustment made'}))
            .catch(err => fn.send_error(err,message, res));
        } else fn.send_error('No adjustment entered', res);
    });
};