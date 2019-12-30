const op = require('sequelize').Op;
module.exports = (app, fn, isLoggedIn, m) => {
    //Display Items
    app.get('/stores/itemSearch', isLoggedIn, (req, res) => {
        var callType    = req.query.c || 'issue',
            supplier_id = Number(req.query.s) || -1,
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
                include: [
                    {
                        model: m.stock,
                        include: [
                            {
                                model: m.locations,
                                where: {_location: {[op.not]: ''}}
                            }
                        ],
                        required: true
                    },{
                        model: m.nsns,
                        where: {_nsn: {[op.not]: ''}}
                    }
                ],
                required: true
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
        var callType = req.body.callType || 'issue';
        if (req.body.item) {
            var item = JSON.parse(req.body.item),
                search = {item_id: item.item_id};
            if (callType === 'order') search._orderable = 1;
            else if (callType === 'receipt') search.supplier_id = req.body.supplier_id;
            fn.getAllWhere(
                m.item_sizes,
                search,
                [
                    m.sizes,
                    {
                        model: m.stock,
                        include: [
                            {
                                model: m.locations,
                                where: {_location: {[op.not]: ''}}
                            }
                        ],
                        required: true
                    },{
                        model: m.nsns,
                        where: {_nsn: {[op.not]: ''}}
                    }
                ]
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
            .catch(err => fn.error(err, '/stores/itemSearch?c=' + callType, req, res));
        } else {
            req.flash('danger', 'No Item Selected');
            res.redirect('/stores/itemSearch?c=' + callType + '&s=' + req.body.supplier_id);
        };
    });

    //Display Size
    app.post('/stores/itemSearch/size', isLoggedIn, (req, res) => {
        var callType = req.body.callType || 'issue';
        if (req.body.item_size) {
            fn.getOne(
                m.item_sizes,
                {itemsize_id: req.body.item_size},
                {
                    include: fn.itemSizeInclude(
                        {include: true},
                        {include: true},
                        {include: false},
                        {include: false},
                        {include: false}
                    ),
                attributes: null,
                nullOK: false
            }                
            )
            .then(item_size => {
                res.render('stores/itemSearch/details', {
                    item_size:   item_size,
                    callType:    callType,
                    supplier_id: req.body.supplier_id
                });
            })
            .catch(err => fn.error(err, '/stores/itemSearch?c=' + callType, req, res));
        } else {
            req.flash('danger', 'No Size Selected')
            res.redirect('/stores/itemSearch/item/' + req.body.item_id + '?c=' + callType + '&s=' + req.body.supplier_id);
        };
    });
};
