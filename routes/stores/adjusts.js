const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/adjusts/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_adjust', true, req, res, (allowed) => {
            if (req.query.at === 'Scrap' || 'Count') {
                if (req.query.si) {
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
                
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/users');
            };
        });
    });
};