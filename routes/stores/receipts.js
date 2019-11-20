const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require('../../db/functions'),
        cn = require('../../db/constructors');
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/receipts/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('receipts_add', true, req, res, (allowed) => {
            res.render('stores/orders/new');
        });
    });
    //New Logic
    app.post('/stores/receipts', mw.isLoggedIn, (req, res) => {
        fn.allowed('receipts_add', true, req, res, (allowed) => {
            if (req.body.selected) {
                var newReceipt = new cn.Receipt(req.body.supplier_id, req.user.user_id)
                fn.create(m.receipts, newReceipt, req, (receipt) => {
                    var receipts = [];
                    req.body.selected.map((receipt) => {
                        if (receipt) {
                            receipt = JSON.parse(receipt);
                            var receiptLine = new cn.ReceiptLine(receipt.stock_id, receipt.qty, receipt.receipt_id);
                            receipts.push(fn.receiveLine(receiptLine, {location_id: receipt.location_id, _qty: receipt.location_qty}));
                        };
                    });
                    if (receipts.length > 0) {
                        Promise.all(receipts)
                        .then(results => {
                            fn.processPromiseResult(results, req, (then) => {
                                res.redirect('/stores/receipts/' + receipt.receipt_id);
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.redirect('/stores/receipts/' + receipt.receipt_id);
                        });
                    } else {
                        fn.delete(m.receipts, {receipt_id: receipt.receipt_id}, req, (next) => {
                            res.redirect('/stores/receipts/' + receipt.receipt_id);
                        });
                    };
                });
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores');
            };
        });
    });

    //Show
    app.get('/stores/receipts/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_receipts', true, req, res, (allowed) => {
            var query = {};
            query.sn = Number(req.query.sn) || 2;
            fn.getReceipt(query, req.params.id, req, (receipt) => {
                fn.getNotes('receipts', req.params.id, req, res, (notes) => {
                    res.render('stores/receipts/show',{
                        receipt: receipt,
                        notes:   notes,
                        query:   query
                    });
                });
            });
        });
    });
    
    //Index
    app.get('/stores/receipts', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_receipts', true, req, res, (allowed) => {
            var query = {};
            query.cr = Number(req.query.cr) || 2;
            fn.getAllReceipts(query, req, (receipts) => {
                res.render('stores/receipts/index',{
                    receipts: receipts,
                    query:    query
                });
            });
        });
    });
};