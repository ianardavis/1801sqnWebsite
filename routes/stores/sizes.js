const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //NEW
    app.get('/stores/sizes/new',         isLoggedIn, allowed('size_add'),                   (req, res) => {
        fn.getOne(m.items, {item_id: req.query.item_id})
        .then(item => {
            fn.getAll(m.suppliers)
            .then(suppliers => {
                res.render('stores/sizes/new', {
                    item:      item,
                    suppliers: suppliers
                });
            })
            .catch(err => fn.error(err, '/stores/items', req, res));
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    //ASYNC GET
    app.get('/stores/getsizes/:key/:id', isLoggedIn, allowed('access_sizes', {send: true}), (req, res) => {
        let where = {};
        where[req.params.key] = req.params.id;
        fn.getAllWhere(
            m.sizes,
            where,
            {include: [inc.items()]}
        )
        .then(sizes => res.send({result: true, sizes: sizes}))
        .catch(err => fn.send_error(err, res));
    });
    //SHOW
    app.get('/stores/sizes/:id',         isLoggedIn, allowed('access_sizes'),               (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.params.id},
            {include: [
                m.items,
                inc.suppliers({as: 'supplier'})
        ]})
        .then(size => {
            res.render('stores/sizes/show', {
                size:  size,
                notes: {table: 'sizes', id: size.size_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    //EDIT
    app.get('/stores/sizes/:id/edit',    isLoggedIn, allowed('size_edit'),                  (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.params.id},
            {
                include: [
                    m.items,
                    inc.suppliers({as: 'supplier'})
        ]})
        .then(size => {
            fn.getAll(m.suppliers)
            .then(suppliers => {
                res.render('stores/sizes/edit', {
                    size:  size,
                    suppliers: suppliers
                });
            })
            .catch(err => fn.error(err, '/stores/sizes/' + req.params.id, req, res));
        })
        .catch(err => fn.error(err, '/', req, res));
    });
    //ASYNC GET SIZES
    app.get('/stores/getsize/:id',       isLoggedIn, allowed('access_sizes', {send: true}), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.params.id},
            {include: [
                inc.stock(),
                inc.nsns(),
                inc.serials()
        ]})
        .then(size => res.send({result: true, size: size}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/getsizes',          isLoggedIn, allowed('access_sizes', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.sizes,
            req.query,
            {include: [inc.stock()]}
        )
        .then(sizes => {
            sizes.forEach(size => size.dataValues.locationStock = fn.summer(size.stocks));
            res.send({result: true, sizes: sizes})
        })
        .catch(err => fn.send_error(err, res));
    });

    //POST
    app.post('/stores/sizes',            isLoggedIn, allowed('size_add',     {send: true}), (req, res) => {
        if (req.body.sizes) {
            let lines = [];
            req.body.sizes.forEach(size => {
                if (size !== '') lines.push(fn.addSize(size, req.body.details));
            });
            if (lines.length > 0) {
                Promise.allSettled(lines)
                .then(results => {
                    results.forEach(result => {
                        if (result.value.result) req.flash('success', 'Size added: ' + result.value.size);
                        else {
                            req.flash('danger', result.value.size + ' not added: ' + result.value.error);
                            console.log(result.value.error);
                        };
                    });
                    res.redirect('/stores/items/' + req.body.details.item_id);
                }).catch((err) => fn.error(err, '/stores/items/' + req.body.details.item_id, req, res));
            } else res.redirect('/stores/items/' + req.body.details.item_id);
        } else {
            req.flash('info', 'No sizes selected!');
            res.redirect('/stores/items/' + req.body.details.item_id);
        };
    });

    //PUT
    app.put('/stores/sizes/:id',         isLoggedIn, allowed('size_edit',    {send: true}), (req, res) => {     
        fn.update(
            m.sizes,
            req.body.size,
            {size_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'Size saved'}))
        .catch(err => fn.send_error(err, res));
    });

    //DELETE
    app.delete('/stores/sizes/:id',      isLoggedIn, allowed('size_delete',  {send: true}), (req, res) => {
        fn.getOne(
            m.stock,
            {size_id: req.params.id},
            {nullOK: true}
        )
        .then(stock => {
            if (stock) fn.send_error('Cannot delete a size whilst it has stock', res)
            else {
                fn.getOne(
                    m.nsns,
                    {size_id: req.params.id},
                    {nullOK: true}
                )
                .then(nsn => {
                    if (nsn) fn.send_error('Cannot delete a size whilst it has NSNs assigned', res)
                    else {
                        fn.delete(
                            m.sizes,
                            {size_id: req.params.id}
                        )
                        .then(result => res.send({result: true, message: 'Size deleted'}))
                        .catch(err => fn.send_error(err, res));
                    };
                })
                .catch(err => fn.send_error(err, res));
            };
        })
        .catch(err => fn.send_error(err, res));
    });
};