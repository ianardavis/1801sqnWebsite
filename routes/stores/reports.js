const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    app.get('/stores/reports', isLoggedIn, allowed('access_reports'), (req, res) => res.render('stores/reports/index'));

    app.get('/stores/reports/:id', isLoggedIn, allowed('access_reports'), (req, res) => {
        if (Number(req.params.id) === 1) {
            fn.getAllWhere(
                m.stock,
                {_qty: {[op.lt]: 0}},
                {include: [m.locations, {model: m.item_sizes, include: fn.itemSize_inc()}], nullOk: true, attributes: null}
            )
            .then(stock => res.render('stores/reports/show/1', {stock: stock}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        } else if (Number(req.params.id) === 2) {
            fn.getAllWhere(
                m.issues,
                {
                    _date_due: {[op.lte]: Date.now()},
                    _complete: 0
                },
                {include: [{model: m.issues_l, as: 'lines'}, fn.users('_for')], nullOk: true, attributes: null}
            )
            .then(issues => res.render('stores/reports/show/2', {issues: issues}))
            .catch(err => fn.error(err, '/stores/reports', req, res));
        };
    });
};