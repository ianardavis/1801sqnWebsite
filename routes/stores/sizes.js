module.exports = (app, m, fn) => {
    app.get('/sizes/select', fn.loggedIn(), fn.permissions.get('access_sizes'),   (req, res) => res.render('stores/sizes/select'));
    app.get('/sizes/:id',    fn.loggedIn(), fn.permissions.get('access_sizes'),   (req, res) => res.render('stores/sizes/show'));

    app.get('/count/sizes',  fn.loggedIn(), fn.permissions.check('access_sizes'), (req, res) => {
        m.sizes.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/sizes',    fn.loggedIn(), fn.permissions.check('access_sizes'), (req, res) => {
        m.sizes.findAll({
            where: req.query,
            include: [
                fn.inc.stores.item(),
                fn.inc.stores.supplier()
            ]
        })
        .then(sizes => res.send({success: true, result: sizes}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/size',     fn.loggedIn(), fn.permissions.check('access_sizes'), (req, res) => {
        fn.get(
            'sizes',
            req.query,
            [
                fn.inc.stores.item(),
                fn.inc.stores.supplier()
            ]
        )
        .then(size => res.send({success: true, result: size}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/sizes',       fn.loggedIn(), fn.permissions.check('size_add'),     (req, res) => {
        if (req.body.size.supplier_id === '') req.body.size.supplier_id = null;
        m.sizes.findOrCreate({
            where: {
                item_id: req.body.size.item_id,
                size: req.body.size.size
            },
            defaults: req.body.size
        })
        .then(([size, created]) => res.send({success: true, message: (created ? 'Size added' : 'Size already exists')}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/sizes/:id',    fn.loggedIn(), fn.permissions.check('size_edit'),    (req, res) => {
        if (req.body.size.supplier_id === '') req.body.size.supplier_id = null;
        m.sizes.update(
            req.body.size,
            {where: {size_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Size saved'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/sizes/:id', fn.loggedIn(), fn.permissions.check('size_delete'),  (req, res) => {
        fn.get(
            'sizes',
            {size_id: req.params.id}
        )
        .then(size => {
            return m.stocks.findOne({where: {size_id: req.params.id}})
            .then(stock => {
                if (stock) fn.send_error(res, 'Cannot delete a size whilst it has stock')
                else {
                    return m.nsns.findOne({where: {size_id: req.params.id}})
                    .then(nsn => {
                        if (nsn) fn.send_error(res, 'Cannot delete a size whilst it has NSNs assigned')
                        else {
                            return size.destroy()
                            .then(result => res.send({success: true, message: 'Size deleted'}))
                            .catch(err => fn.send_error(res, err));
                        };
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};