const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    //Display Items
    app.get('/stores/itemSearch', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, (allowed) => {
            var callType = req.query.callType || 'issue';
            fn.getAll(m.items, req, false, (items) => {
                res.render('stores/itemSearch/items', {
                    items:    items,
                    callType: callType
                });
            });
        });
    });
    app.post('/stores/itemSearch', mw.isLoggedIn, (req, res) => {
        var callType = req.body.callType || 'issue';
        if (req.body.item) {
            fn.allowed('access_items', true, req, res, (allowed) => {
                var item = JSON.parse(req.body.item)
                res.redirect('/stores/itemSearch/item/' + item.item_id + '?d=' + item._description + '&callType=' + callType);
            });
        } else {
            req.flash('danger', 'No Item Selected')
            res.redirect('/stores/itemSearch?callType=' + callType);
        };
    });

    //Display Sizes
    app.get('/stores/itemSearch/item/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, (allowed) => {
            var callType = req.query.callType || 'issue';
            fn.getAllItemSizesWhere({item_id: req.params.id}, req, (sizes) => {
                res.render('stores/itemSearch/sizes', {
                    sizes:       sizes,
                    item_id:     req.params.id,
                    description: req.query.d,
                    callType:    callType
                });
            });
        });
    });
    app.post('/stores/itemSearch/size', mw.isLoggedIn, (req, res) => {
        var callType = req.body.callType || 'issue';
        if (req.body.size) {
            fn.allowed('access_items', true, req, res, (allowed) => {
                res.redirect('/stores/itemSearch/size/' + req.body.size + '?callType=' + callType);
            });
        } else {
            req.flash('danger', 'No Size Selected')
            res.redirect('/stores/itemSearch/item/' + req.body.item_id + '?callType=' + callType);
        };
    });

    //Display Size
    app.get('/stores/itemSearch/size/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, (allowed) => {
            var callType = req.query.callType || 'issue';
            fn.getItemSize(req.params.id,req, {include: true}, {include: true}, {include: false}, {include: false}, (size) => {
                if (size) {
                    res.render('stores/itemSearch/details', {
                        size:     size,
                        callType: callType
                    });
                } else {
                    res.redirect('/stores/itemSearch?callType=' + callType);
                };
            });
        });
    });
};