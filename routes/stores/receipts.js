const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require('../../db/functions'),
        cn = require('../../db/constructors');
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/receipts/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('receipts_add', true, req, res, allowed => {
            if (req.query.s && req.query.s !== '') {
                fn.getOne(
                    m.suppliers,
                    {supplier_id: req.query.s}
                )
                .then(supplier => {
                    res.render('stores/receipts/new',{supplier: supplier});
                })
                .catch(err => {
                    console.log(err);
                    req.flash('danger', err.message);
                    res.redirect('back');
                });
            } else {
                req.flash('danger', 'No supplier specified');
                res.redirect('back');
            };
        });
    });
    //New Logic
    app.post('/stores/receipts', mw.isLoggedIn, (req, res) => {
        fn.allowed('receipts_add', true, req, res, allowed => {
            if (req.body.selected) {
                var lines = []
                req.body.selected.forEach(line => {
                    lines.push(JSON.parse(line));
                });
                fn.receiveStock(lines, req.body.supplier_id, req.user.user_id)
                .then(result => {
                    res.redirect('/stores/receipts/' + result);
                })
                .catch(err => {
                    fn.error(err, '/stores/receipts', req, res);
                });
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores');
            };
        });
    });

    //Show
    app.get('/stores/receipts/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_receipts', true, req, res, allowed => {
            var query = {};
            query.sn = Number(req.query.sn) || 2;
            fn.getOne(
                m.receipts,
                {receipt_id: req.params.id},
                [
                    {
                        model: m.receipts_l,
                        as: 'lines',
                        include: [
                            {
                                model: m.stock, include: [m.locations, fn.item_sizes(false, true)]
                            }
                        ]
                    },
                    fn.users(),
                    m.suppliers
                ]
            )
            .then(receipt => {
                fn.getNotes('receipts', req.params.id, req, res)
                .then(notes => {
                    res.render('stores/receipts/show', {
                        receipt: receipt,
                        notes:   notes,
                        query:   query
                    });
                });
            })
            .catch(err => {
                fn.error(err, '/stores/receipts', req, res);
            });
        });
    });
    
    //Index
    app.get('/stores/receipts', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_receipts', true, req, res, allowed => {
            var query = {};
            query.cr = Number(req.query.cr) || 2;
            fn.getAll(
                m.receipts,
                [
                    m.suppliers,
                    fn.users(),
                    {
                        model: m.receipts_l,
                        as: 'lines'
                    }
                ]
            )
            .then(receipts => {
                res.render('stores/receipts/index',{
                    receipts: receipts,
                    query:    query
                });
            })
            .catch(err => {
                fn.error(err, '/stores', req, res);
            });
        });
    });
};