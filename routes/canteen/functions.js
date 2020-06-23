const op = require('sequelize').Op,
      cn = require(process.env.ROOT + '/db/constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      ex = require('exceljs'),
      pd = require('pdfkit');
module.exports = (fn, m, inc) => {
    fn.createCanteenSaleLine = (sale_id, lines) => new Promise((resolve, reject) => {
        let actions = [];
        for (let [_sale, line] of Object.entries(lines)) {
            fn.getOne(m.canteen_items, {item_id: line.item_id})
            .then(item => {
                actions.push(
                    fn.create(
                        m.canteen_sale_lines,
                        {
                            sale_id: sale_id,
                            item_id: line.item_id,
                            _qty: line.qty,
                            _cost_each: item._value
                        }
                    )
                );
                actions.push(fn.subtractCanteenStock(line.item_id, line.qty))
            })
            .catch(err => reject(err));
        };
        Promise.allSettled(actions)
        .then(results => resolve(true))
        .catch(err => reject(err));
    });
    fn.getSession = (req, res, options = {}) => new Promise(resolve => {
        fn.getSetting({setting: 'canteen_session', default: -1})
        .then(session_id => {
            if (Number(session_id) === -1 && options.redirect) {
                req.flash('danger', 'No session open');
                res.redirect('/canteen');
            } else resolve(session_id);
        })
        .catch(err => {
            res.error.redirect(err, req, res)
        })
    });
    fn.getSale = (req, res) => new Promise(resolve => {
        fn.getSetting({setting: 'sale_' + req.user.user_id, default: -1})
        .then(sale_id => {
            if (Number(sale_id) === -1) {
                fn.getSession(req, res, {redirect: true})
                .then(session_id => {
                    fn.create(
                        m.canteen_sales,
                        {
                            session_id: session_id,
                            user_id: req.user.user_id
                        }
                    )
                    .then(sale => {
                        fn.editSetting('sale_' + req.user.user_id, sale.sale_id)
                        .then(result => {
                            if (result) resolve(sale.sale_id)
                            else res.error.redirect(new error('User sale not saved to setting'), req, res);
                        })
                        .catch(err => res.error.redirect(err, req, res));
                    })
                    .catch(err => res.error.redirect(err, req, res));
                });
            } else resolve(sale_id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    fn.completeCanteenMovement = (action, line, table) => new Promise((resolve, reject) => {
        fn[action + 'Stock'](line.item_id, line._qty, 'canteen_items')
        .then(qty => {
            fn.update(
                m[table],
                {_new_qty: qty},
                {line_id: line.line_id}
            )
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err))
    });
};