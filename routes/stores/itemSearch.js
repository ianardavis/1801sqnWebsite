module.exports = (app, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    //Display Items
    app.get('/stores/itemSearch',       isLoggedIn, (req, res) => {
        let supplier_id = Number(req.query.supplier_id) || -1,
			callType    = req.query.callType || 'issue',
            include		= [];
        if (callType === 'receipt') {
            include.push(
                inc.sizes({
                    as:       'sizes',
                    where:    {supplier_id: supplier_id},
                    required: true}))
        } else if (callType === 'order') {
            include.push(
                inc.sizes({
                    as:      'sizes',
                    where:    {_orderable: 1},
                    required: true}))
        } else if (callType === 'issue') {
            include.push(
                inc.sizes({
                    as:      'sizes',
                    where:   {_issueable: 1},
                    include: [
                        inc.stock({
                            require_locations: true,
                            required: true}),
                        inc.nsns({
                            required: true})]}))
        } else if (callType === 'request') {
            include.push(
                inc.sizes({
                    as:       'sizes', 
                    where:    {_issueable: 1},
                    required: true}))
        } else if (callType === 'demand') {
            include.push(
                inc.sizes({
                    as:      'sizes',
                    where:    {
                        _orderable:  1,
                        supplier_id: supplier_id
                    },
                    required: true}))
        };
        m.items.findAll({include: include})
        .then(items => {
            res.render('stores/itemSearch/details', {
                items:       items,
                callType:    callType,
                id:          req.query.id,
                supplier_id: supplier_id
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    //Display Sizes
    app.post('/stores/itemSearch',      isLoggedIn, (req, res) => {
        let callType = req.body.callType || 'issue';
        if (req.body.item_id) {
            let search  = {item_id: req.body.item_id},
                include = [inc.items()];
            if (callType === 'order') {
                search._orderable = 1;
            } else if (callType === 'receipt') {
                search.supplier_id = req.body.supplier_id;
                include.push(
                    inc.stock({
                        required:          true,
                        locations:         true,
                        require_locations: true}))
            } else if (callType === 'issue') {
                search._issueable = 1;
                include.push(
                    inc.stock({
                        required:          true,
                        locations:         true,
                        require_locations: true}))
                include.push(
                    inc.nsns({
                        required: true}))
            } else if (callType === 'request') {
                search._issueable = 1;
            } else if (callType === 'demand') {
                search._orderable  = 1;
                search.supplier_id = req.body.supplier_id
            };
            m.sizes.findAll({
                where: search,
                include: include
            })
            .then(sizes => res.send({result: true, sizes: sizes}))
            .catch(err => res.error.send(err, res));
        } else res.error.send('No Item Selected', res);
    });

    //Display Size
    app.post('/stores/itemSearch/size', isLoggedIn, (req, res) => {
        let callType = req.body.callType || 'issue',
            include_options  = {nsns: true, stock: true, serials: false};
        if (callType === 'issue') {
            include_options.serials = {};
            include_options.serials.issued = false;
        };
        if (req.body.size_id) {
            db.findOne({
                table: m.sizes,
                where: {
                    size_id: req.body.size_id,
                    _issueable: 1
                },
                include: [m.items, inc.nsns(), inc.stock(), inc.serials()]
            })
            .then(size => res.send({result: true, size: size}))
            .catch(err => res.error.send(err, res));
        } else res.error.send('No size selected', res);
    });
};
