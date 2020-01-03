const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    app.get('/stores/reports', isLoggedIn, allowed('access_reports'), (req, res) => {
        res.render('stores/reports/index');
    });

    app.get('/stores/reports/:id', isLoggedIn, allowed('access_reports'), (req, res) => {
        if (Number(req.params.id) === 1) {
            fn.getAllWhere(
                m.stock,
                {_qty: {[op.lt]: 0}},
                {include: [m.locations, {model: m.item_sizes, include: fn.itemSize_inc()}], nullOk: true, attributes: null}
            )
            .then(stock => res.render('stores/reports/show/1', {stock: stock}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        };
    });
};