const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");
        
module.exports = (app, m) => { 
    //Index
    app.get('/stores/loancards', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_loancards', true, req, res, (allowed) => {
            fn.getAllLoancards(req.query.closed, req, (loancards) => {
                res.render('stores/loancards/index',{
                    loancards: loancards,
                    closed: Number(req.query.closed)
                });
            });
        });
    });

    //Show
    app.get('/stores/loancards/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_loancards', true, req, res, (allowed) => {
            fn.getLoancard(req.params.id, req, (loancard) => {
                fn.getNotes('loancards', req.params.id, req, (notes) => {
                    res.render('stores/loancards/show',{
                        loancard: loancard,
                        notes:    notes
                    });
                });
            });
        });
    });
};