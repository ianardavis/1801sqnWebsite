let settings = require(process.env.ROOT + '/fn/settings'),
    stock    = require('../../stores/functions/stock');
module.exports = {
    getSession: (req, res, options = {}) => new Promise(resolve => {
        options.m.settings.findOrCreate({
            where: {_name: 'canteen_session'},
            defaults: {_value: -1}
        })
        .then(setting => {
            if (Number(setting._value) === -1 && options.redirect) {
                req.flash('danger', 'No session open');
                res.redirect('/canteen');
            } else resolve(setting._value);
        })
        .catch(err => send_error(res, err))
    }),
    completeMovement: (options = {}, action, line, table) => new Promise((resolve, reject) => {
        stock[options.action]({
            table: options.m.canteen_items,
            id: options.line.item_id,
            by: options.line._qty
        })
        .then(qty => {
            options.m.update.update(
                {_new_qty: qty},
                {where: {line_id: line.line_id}}
            )
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err))
    }),
    getSale: (req, res) => new Promise(resolve => {
        settings.get({
            m: {settings: m.settings},
            name: 'sale_' + req.user.user_id,
            default: -1
        })
        .then(sale_id => {
            if (Number(sale_id) === -1) {
                settings.get({
                    m: {settings: m.settings},
                    name: 'canteen_session',
                    default: -1
                })
                .then(session_id => {
                    if (Number(session_id) === -1) {
                        req.flash('danger', 'No session open');
                        res.redirect('/canteen');
                    } else {
                        m.canteen_sales.create({
                            session_id: session_id,
                            user_id: req.user.user_id
                        })
                        .then(sale => {
                            settings.edit({
                                m: {settings: m.settings},
                                name: 'sale_' + req.user.user_id,
                                value: sale.sale_id
                            })
                            .then(result => {
                                if (result) resolve(sale.sale_id)
                                else send_error(res, 'User sale not saved to setting');
                            })
                            .catch(err => send_error(res, err));
                        })
                        .catch(err => send_error(res, err));
                    };
                })
            } else resolve(sale_id);
        })
        .catch(err => send_error(res, err));
    })
};