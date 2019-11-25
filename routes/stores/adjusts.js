const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/adjusts/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_adjust', true, req, res, allowed => {
            if (req.query.at === 'Scrap' || 'Count') {
                if (req.query.si) {
                    fn.getOne(
                        m.stock,
                        {stock_id: req.query.si},
                        [fn.item_sizes(false, true)]
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
                    .catch(err => {
                        fn.error(err, '/stores/item_sizes/' + req.query.si, req, res);
                    });
                } else {
                    req.flash('danger', 'No item specified');
                    res.redirect('/stores/items');
                };
            } else {
                req.flash('danger', 'Invalid request');
                res.redirect('/stores/items');
            };            
        });
    });
    //New Logic
    app.post('/stores/adjusts', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_adjust', true, req, res, allowed => {
            var adjust = req.body.adjust;
            if (adjust) {
                adjust._date = Date.now();
                adjust.user_id = req.user.user_id;
                fn.create(
                    m.adjusts, 
                    adjust
                )
                .then(newAdjust => {
                    var newQty = {};
                    if (adjust._type === 'Count') {
                        fn.update(
                            m.stock,
                            {_qty: qty},
                            {stock_id: newAdjust.stock_id}
                        )
                        .then(result => {
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
                            res.redirect('/stores/stock/' + newAdjust.stock_id + '/edit');
                        })
                        .catch(err => {
                            fn.error(err, '/stores/stock/' + newAdjust.stock_id + '/edit', req, res);
                        });
                    };
                })
                .catch(err => {
                    fn.error(err, '/stores/stock/' + newAdjust.stock_id + '/edit', req, res);
                });
            } else {
                req.flash('info', 'No adjustment entered!');
                res.redirect('/stores/items');
            };
        });
    });
};