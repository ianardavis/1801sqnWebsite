module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/adjusts/new', isLoggedIn, allowed('adjust_add'), (req, res) => {
        if (req.query.adjustType === 'Scrap' || 'Count') {
            if (req.query.stock_id) {
                db.findOne({
                    table: m.stock,
                    where: {stock_id: req.query.stock_id},
                    include: [
                        inc.sizes(),
                        m.locations
                    ]
                })
                .then(stock => {
                    res.render('stores/adjusts/new', {
                        stock: stock,
                        query: req.query
                    });
                })
                .catch(err => res.error.redirect(err, req, res));
            } else res.error.redirect(new Error('No item specified'), req, res);
        } else res.error.redirect(new Error('Invalid request'), req, res);
    });
    app.post('/stores/adjusts',    isLoggedIn, allowed('adjust_add', {send: true}), (req, res) => {
        if (req.body.adjust) {
            req.body.adjust.user_id = req.user.user_id;
            stock.adjust({
                m: {stock: m.stock, adjusts: m.adjusts},
                adjustment: req.body.adjust
            })
            .then(results => res.send({result: true, message: 'Adjustment made'}))
            .catch(err => res.error.send(err.message, res));
        } else res.error.send('No adjustment entered', res);
    });
};