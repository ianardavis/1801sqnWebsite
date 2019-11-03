const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");
        
module.exports = (app, m) => { 
    //Index
    app.get('/stores/loancards', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_loancards', true, req, res, (allowed) => {
            var query = {};
            query.cl = Number(req.query.cl) || 2;
            fn.getAllLoancards(req.query.closed, req, (loancards) => {
                res.render('stores/loancards/index',{
                    loancards: loancards,
                    query:     query
                });
            });
        });
    });

    //Show
    app.get('/stores/loancards/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_loancards', false, req, res, (allowed) => {
            var query = {};
            query.sn = Number(req.query.sn) || 2;
            fn.getLoancard(req.params.id, req, (loancard) => {
                if (allowed || loancard.issuedTo.user_id === req.user.user_id) {
                    fn.getNotes('loancards', req.params.id, req, res, (notes) => {
                        res.render('stores/loancards/show',{
                            loancard: loancard,
                            notes:    notes,
                            query:    query
                        });
                    });
                } else {
                    req.flash('danger', 'Permission Denied!')
                    res.redirect('back');
                }; 
            });
        });
    });
};