const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/adjusts/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_adjust', true, req, res, (allowed) => {
            if (req.query.at === 'Scrap' || 'Count') {
                if (req.query.li) {
                    fn.getLocation(
                        req.query.li,
                        req, 
                        (location) => {
                            if (location) {
                                res.render('stores/adjusts/new', {
                                    location: location,
                                    query:    req.query
                                }); 
                            } else {
                                res.redirect('/stores/items')
                            };
                        }
                    );
                } else {
                    req.flash('danger', 'No item specified!');
                    res.redirect('/stores/items');
                };
            } else {
                req.flash('danger', 'Invalid request!');
                res.redirect('/stores/items');
            };            
        });
    });
    //New Logic
    app.post('/stores/adjusts', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_adjust', true, req, res, (allowed) => {
            if (req.body.adjust) {
                req.body.adjust._date = Date.now();
                req.body.adjust.user_id = req.user.user_id;
                fn.create(m.adjusts, req.body.adjust, req, (newAdjust) => {
                    var newQty = {};
                    if (req.body.adjust._adjust_type === 'Count') {
                        newQty._qty = newAdjust._qty;
                        fn.update(m.locations, newQty, {location_id: newAdjust.location_id}, req, (result) => {
                            res.redirect('/stores/locations/' + newAdjust.location_id + '/edit');
                        });
                    } else if (req.body.adjust._adjust_type === 'Scrap'){
                        fn.getLocation(newAdjust.location_id,req, (location) => {
                            newQty._qty = location._qty - newAdjust._qty;
                            fn.update(m.locations, newQty, {location_id: newAdjust.location_id}, req, (result) => {
                                res.redirect('/stores/locations/' + newAdjust.location_id + '/edit');
                            });
                        });
                    };
                });
            } else {
                req.flash('info', 'No adjustment entered!');
                res.redirect('/stores/items');
            };
        });
    });
};