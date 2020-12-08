const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let utils = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/sizes/new',      permissions, allowed('size_add'),                   (req, res) => {
        m.items.findOne({where: {item_id: req.query.item_id}})
        .then(item => res.render('stores/sizes/new', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/sizes/:id',      permissions, allowed('access_sizes'),               (req, res) => res.render('stores/sizes/show', {tab:  req.query.tab || 'details'}));
    app.get('/stores/sizes/:id/edit', permissions, allowed('size_edit'),                  (req, res) => res.render('stores/sizes/edit'));

    app.get('/stores/get/sizes',      permissions, allowed('access_sizes', {send: true}), (req, res) => {
        m.sizes.findAll({
            where: req.query,
            include: [
                inc.items(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(sizes => {
            sizes.forEach(size => size.dataValues.locationStock = utils.summer(size.stocks));
            res.send({result: true, sizes: sizes})
        })
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/sizes',         permissions, allowed('size_add',     {send: true}), (req, res) => {
        req.body.size._ordering_details = req.body.size._ordering_details.trim()
        req.body.size = utils.nullify(req.body.size);
        m.sizes.findOrCreate({
            where: {
                item_id: req.body.size.item_id,
                _size: req.body.size._size
            },
            defaults: req.body.size
        })
        .then(([size, created]) => {
            let message = 'Size added';
            if (!created) message = 'Size already exists'
            res.send({result: true, message: message})
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/sizes/:id',      permissions, allowed('size_edit',    {send: true}), (req, res) => {
        m.sizes.update(
            req.body.size,
            {where: {size_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'Size saved'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/sizes/:id',   permissions, allowed('size_delete',  {send: true}), (req, res) => {
        m.stock.findOne({where: {size_id: req.params.id}})
        .then(stock => {
            if (stock) res.error.send('Cannot delete a size whilst it has stock', res)
            else {
                m.nsns.findOne({where: {size_id: req.params.id}})
                .then(nsn => {
                    if (nsn) res.error.send('Cannot delete a size whilst it has NSNs assigned', res)
                    else {
                        m.sizes.destroy({where: {size_id: req.params.id}})
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