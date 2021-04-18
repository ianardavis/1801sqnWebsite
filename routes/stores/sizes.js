module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/sizes/select', li, pm.get, pm.check('access_sizes'),               (req, res) => res.render('stores/sizes/select'));
    app.get('/sizes/:id',    li, pm.get, pm.check('access_sizes'),               (req, res) => res.render('stores/sizes/show'));

    app.get('/count/sizes',  li,         pm.check('access_sizes', {send: true}), (req, res) => {
        m.sizes.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/sizes',    li,         pm.check('access_sizes', {send: true}), (req, res) => {
        m.sizes.findAll({
            where: req.query,
            include: [
                inc.items(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(sizes => res.send({success: true, result: sizes}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/size',     li,         pm.check('access_sizes', {send: true}), (req, res) => {
        m.sizes.findOne({
            where: req.query,
            include: [
                inc.items(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(size => {
            if (size) res.send({success: true, result: size})
            else send_error(res, 'Size not found');
        })
        .catch(err => send_error(res, err));
    });

    app.post('/sizes',       li,         pm.check('size_add',     {send: true}), (req, res) => {
        if (req.body.size.supplier_id === '') req.body.size.supplier_id = null;
        m.sizes.findOrCreate({
            where: {
                item_id: req.body.size.item_id,
                size: req.body.size.size
            },
            defaults: req.body.size
        })
        .then(([size, created]) => res.send({success: true, message: (created ? 'Size added' : 'Size already exists')}))
        .catch(err => send_error(res, err));
    });
    app.put('/sizes/:id',    li,         pm.check('size_edit',    {send: true}), (req, res) => {
        if (req.body.size.supplier_id === '') req.body.size.supplier_id = null;
        m.sizes.update(
            req.body.size,
            {where: {size_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Size saved'}))
        .catch(err => send_error(res, err));
    });

    app.delete('/sizes/:id', li,         pm.check('size_delete',  {send: true}), (req, res) => {
        m.sizes.findOne({where: {size_id: req.params.id}})
        .then(size => {
            if (!size) send_error(res, 'Size not found')
            else {
                return m.stocks.findOne({where: {size_id: req.params.id}})
                .then(stock => {
                    if (stock) send_error(res, 'Cannot delete a size whilst it has stock')
                    else {
                        return m.nsns.findOne({where: {size_id: req.params.id}})
                        .then(nsn => {
                            if (nsn) send_error(res, 'Cannot delete a size whilst it has NSNs assigned')
                            else {
                                return size.destroy()
                                .then(result => res.send({success: true, message: 'Size deleted'}))
                                .catch(err => send_error(res, err));
                            };
                        })
                        .catch(err => send_error(res, err));
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};