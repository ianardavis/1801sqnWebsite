const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db    = require(process.env.ROOT + '/fn/db'),
        sizes = require(process.env.ROOT + '/fn/sizes'),
        utils = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/sizes/new',          isLoggedIn, allowed('size_add'),                   (req, res) => {
        db.findOne({
            table: m.items,
            where: {item_id: req.query.item_id}
        })
        .then(item => {
            m.suppliers.findAll()
            .then(suppliers => {
                res.render('stores/sizes/new', {
                    item:      item,
                    suppliers: suppliers
                });
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/get/sizes/:key/:id', isLoggedIn, allowed('access_sizes', {send: true}), (req, res) => {
        let where = {};
        where[req.params.key] = req.params.id;
        m.sizes.findAll({
            where: where,
            include: [inc.items()]
        })
        .then(sizes => res.send({result: true, sizes: sizes}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/sizes/:id',          isLoggedIn, allowed('access_sizes'),               (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.params.id},
            include: [
                m.items,
                inc.suppliers({as: 'supplier'})
        ]})
        .then(size => {
            res.render('stores/sizes/show', {
                size:  size,
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/sizes/:id/edit',     isLoggedIn, allowed('size_edit'),                  (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.params.id},
            include: [
                m.items,
                inc.suppliers({as: 'supplier'})
        ]})
        .then(size => {
            m.suppliers.findAll()
            .then(suppliers => {
                res.render('stores/sizes/edit', {
                    size:  size,
                    suppliers: suppliers
                });
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/get/size/:id',       isLoggedIn, allowed('access_sizes', {send: true}), (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.params.id},
            include: [
                inc.stock(),
                inc.nsns(),
                inc.serials()
        ]})
        .then(size => res.send({result: true, size: size}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/sizes',          isLoggedIn, allowed('access_sizes', {send: true}), (req, res) => {
        m.sizes.findAll({
            where: req.query,
            include: [inc.stock()]
        })
        .then(sizes => {
            sizes.forEach(size => size.dataValues.locationStock = utils.summer(size.stocks));
            res.send({result: true, sizes: sizes})
        })
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/sizes',             isLoggedIn, allowed('size_add',     {send: true}), (req, res) => {
        if (req.body.sizes) {
            let lines = [];
            req.body.sizes.forEach(size => {
                if (size !== '') lines.push(
                    sizes.add({
                        m: {sizes: m.sizes},
                        details: {...{_size: size}, ...req.body.details}
                    })
                );
            });
            if (lines.length > 0) {
                Promise.allSettled(lines)
                .then(results => {
                    results.forEach(result => {
                        if (result.value.created) req.flash('success', 'Size added: ' + result.value.size);
                        else {
                            req.flash('danger', result.value.size + ' not added: ' + result.value.message);
                            console.log(result.value.message);
                        };
                    });
                    res.redirect('/stores/items/' + req.body.details.item_id);
                }).catch((err) => res.error.redirect(err, req, res));
            } else res.redirect('/stores/items/' + req.body.details.item_id);
        } else {
            req.flash('info', 'No sizes selected!');
            res.redirect('/stores/items/' + req.body.details.item_id);
        };
    });
    app.put('/stores/sizes/:id',          isLoggedIn, allowed('size_edit',    {send: true}), (req, res) => {     
        db.update({
            table: m.sizes,
            where: {size_id: req.params.id},
            record: req.body.size
        })
        .then(result => res.send({result: true, message: 'Size saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/sizes/:id',       isLoggedIn, allowed('size_delete',  {send: true}), (req, res) => {
        m.stock.findOne({where: {size_id: req.params.id}})
        .then(stock => {
            if (stock) res.error.send('Cannot delete a size whilst it has stock', res)
            else {
                m.nsns.findOne({where: {size_id: req.params.id}})
                .then(nsn => {
                    if (nsn) res.error.send('Cannot delete a size whilst it has NSNs assigned', res)
                    else {
                        db.destroy({
                            table: m.sizes,
                            where: {size_id: req.params.id}
                        })
                        .then(result => res.send({result: true, message: 'Size deleted'}))
                        .catch(err => res.error.send(err, res));
                    };
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};