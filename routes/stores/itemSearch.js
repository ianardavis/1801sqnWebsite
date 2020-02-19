module.exports = (app, fn, isLoggedIn, m) => {
    //Display Items
    app.get('/stores/itemSearch', isLoggedIn, (req, res) => {
        let callType    = req.query.c || 'issue',
            supplier_id = Number(req.query.supplier_id) || -1,
			include		= [];
        if (callType === 'receipt') {
            include.push({
                model: m.item_sizes,
                where: {supplier_id: supplier_id}
            })
        } else if (callType === 'order') {
            include.push({
                model: m.item_sizes,
                where: {_orderable: 1}
            })
        } else if (callType === 'issue') {
            include.push({
                model: m.item_sizes,
                where: {_issueable: 1},
                include: [
                    {
                        model: m.stock,
                        include: [
                            {
                                model: m.locations,
                                required: true
                            }
                        ],
                        required: true
                    },{
                        model: m.nsns,
                        required: true
                    }
                ]
            })
        } else if (callType === 'request') {
            include.push({
                model: m.item_sizes,
                where: {_issueable: 1}
            })
        };
        fn.getAll(
            m.items,
			include
        )
        .then(items => {
            res.render('stores/itemSearch/items', {
                items:       items,
                callType:    callType,
                supplier_id: supplier_id
            });
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //Display Sizes
    app.post('/stores/itemSearch', isLoggedIn, (req, res) => {
        let callType = req.body.callType || 'issue';
        if (req.body.item) {
            let item    = JSON.parse(req.body.item),
                search  = {item_id: item.item_id},
                include = [];
            if (callType === 'order') {
                search._orderable = 1;
            } else if (callType === 'receipt') {
                search.supplier_id = req.body.supplier_id;
                include.push({
                    model: m.stock,
                    include: [
                        {
                            model: m.locations,
                            required: true
                        }
                    ],
                    required: true
                })
            } else if (callType === 'issue') {
                search._issueable = 1;
                include.push({
                    model: m.stock,
                    include: [
                        {
                            model: m.locations,
                            required: true
                        }
                    ],
                    required: true
                })
                include.push({
                    model: m.nsns,
                    required: true
                })
            } else if (callType === 'request') {
                search._issueable = 1;
            };
            fn.getAllWhere(
                m.item_sizes,
                search,
                {
                    include: include
                }
            )
            .then(item_sizes => {
                res.render('stores/itemSearch/sizes', {
                    item_sizes:  item_sizes,
                    item_id:     item.item_id,
                    description: item._description,
                    callType:    callType,
                    supplier_id: req.body.supplier_id
                });
            })
            .catch(err => fn.error(err, '/stores/itemSearch?callType=' + callType, req, res));
        } else {
            req.flash('danger', 'No Item Selected');
            res.redirect('/stores/itemSearch?callType=' + callType + '&s=' + req.body.supplier_id);
        };
    });

    //Display Size
    app.post('/stores/itemSearch/size', isLoggedIn, (req, res) => {
        let callType = req.body.callType || 'issue',
            include_options  = {nsns: true, stock: true, serials: false};
        if (callType === 'issue') {
            include_options.serials = {};
            include_options.serials.issued = false;
        };
        if (req.body.item_size) {
            fn.getOne(
                m.item_sizes,
                {
                    item_size_id: req.body.item_size,
                    _issueable: 1
                },{
                    include: fn.itemSize_inc(include_options)
                }                
            )
            .then(item_size => {
                res.render('stores/itemSearch/details', {
                    item_size:   item_size,
                    callType:    callType,
                    supplier_id: req.body.supplier_id
                });
            })
            .catch(err => fn.error(err, '/stores/itemSearch?callType=' + callType, req, res));
        } else {
            req.flash('danger', 'No Size Selected')
            res.redirect('/stores/itemSearch/item/' + req.body.item_id + '?callType=' + callType + '&supplier_id=' + req.body.supplier_id);
        };
    });
};
