const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/items_nsns', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_nsn_add', res, (allowed) => {
            if (allowed) {
                m.items_nsns.create(req.body.nsn
                ).then((location) => {
                    req.flash('success', 'NSN added!');
                    res.redirect('/stores/items_sizes/' + location.stock_id);
                }).catch((err) => {
                    req.flash('danger', 'Error adding new NSN!')
                    console.log(err);
                    res.redirect('/stores/items');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items');
            }
        });
    });

    // New Form
    app.get('/stores/items_nsns/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_nsn_add', res, (allowed) => {
            if (allowed) {
                fn.getOne(m.items_sizes, req, res, {stock_id: req.query.stock_id}, (details) => {
                    fn.getOne(m.items, req, res, {item_id: details.item_id}, (item) => {
                        fn.getOne(m.sizes, req, res, {size_id: details.size_id}, (size) => {
                            details._size_text = size._text;
                            res.render('stores/items_nsns/new', {
                                item:       item, 
                                details:    details});
                        });
                    });
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items');
            }
        });
    });

    // Edit
    app.get('/stores/items_nsns/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_nsn_edit', res, (allowed) => {
            if (allowed) {
                m.items_nsns.findOne({
                    where: {nsn_id: req.params.id},
                    include: [
                        {
                            model:m.items_sizes, 
                            as: 'size',
                            include:
                            [
                                m.items, m.sizes
                            ]
                        }
                    ]
                }).then((nsn) => {
					fn.getNotes('items_nsns', req.params.id, req, (notes) => {
		                res.render('stores/items_nsns/edit', {
		                    nsn:        nsn,
		                    notes:      notes
		                });
		            });
				}).catch((err) => {
                    req.flash('danger', 'Error finding NSN!');
                    console.log(err);
                    res.redirect('/stores/items');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('back');
            }
        });
    });

    // Put
    app.put('/stores/items_nsns/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_nsn_edit', res, (allowed) => {
            if (allowed) {
                m.items_nsns.update(
                    req.body.nsn
                    ,{
                        where: {nsn_id: req.params.id}
                    }
                ).then((item) => {
                    req.flash('success', 'NSN edited');
                    res.redirect('/stores/items_sizes/' + item.stock_id)
                }).catch((err) => {
                    req.flash('danger', 'Error editing NSN!');
                    console.log(err);
                    res.redirect('back');            
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('back');
            }
        });
    });

    // Delete
    app.delete('/stores/items_nsns/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_nsn_delete', res, (allowed) => {
            fn.getOne(m.items_locations,req, res, {nsn_id: req.params.id}, (nsn) => {
                fn.delete(allowed, m.items_nsns, {nsn_id: req.params.id}, req, (result) => {
                    res.redirect('/stores/items_sizes/' + nsn.stock_id);
                });
            });
        });
    });
}
