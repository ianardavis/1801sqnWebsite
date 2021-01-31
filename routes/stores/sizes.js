const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    let nullify = require(`../functions/nullify`);
    app.get('/stores/sizes/:id',      pm, al('access_sizes'),               (req, res) => res.render('stores/sizes/show'));

    app.get('/stores/count/sizes',    pm, al('access_sizes', {send: true}), (req, res) => {
        m.stores.sizes.count({where: req.query})
        .then(count => res.send({success: true, count: count}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/sizes',      pm, al('access_sizes', {send: true}), (req, res) => {
        m.stores.sizes.findAll({
            where: req.query,
            include: [
                inc.items(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(sizes => res.send({success: true, result: sizes}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/size',       pm, al('access_sizes', {send: true}), (req, res) => {
        m.stores.sizes.findOne({
            where: req.query,
            include: [
                inc.items(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(size => {
            if (size) res.send({success: true, result: size})
            else      res.send({success: false, message: 'Size not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/details',    pm, al('access_sizes', {send: true}), (req, res) => {
        m.stores.details.findAll({
            where: req.query,
            attributes: ['detail_id', 'size_id',  '_name', '_value']
        })
        .then(details => res.send({success: true,  result: details}))
        .catch(err =>    res.send({success: false, message: `Error getting details: ${err.message}`}));
    });
    app.get('/stores/get/detail',    pm, al('access_sizes', {send: true}), (req, res) => {
        m.stores.details.findOne({
            where: req.query,
            attributes: ['detail_id', 'size_id', '_name', '_value']
        })
        .then(detail => res.send({success: true,  result: detail}))
        .catch(err =>   res.send({success: false, message: `Error getting detail: ${err.message}`}));
    });

    app.post('/stores/sizes',         pm, al('size_add',     {send: true}), (req, res) => {
        req.body.size._ordering_details = req.body.size._ordering_details.trim()
        req.body.size = nullify(req.body.size);
        m.stores.sizes.findOrCreate({
            where: {
                item_id: req.body.size.item_id,
                _size: req.body.size._size
            },
            defaults: req.body.size
        })
        .then(([size, created]) => {
            let message = 'Size added';
            if (!created) message = 'Size already exists'
            res.send({success: true, message: message})
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/details',       pm, al('size_edit',    {send: true}), (req, res) => {
        if      (!req.body.detail._name) res.send({success: false, message: 'Name not submitted'})
        else if (!req.body.detail._name) res.send({success: false, message: 'Value not submitted'})
        else {
            m.stores.details.findOrCreate({
                where:    {
                    size_id: req.body.detail.size_id,
                    _name:   req.body.detail._name
                },
                defaults: {_value: req.body.detail._value}
            })
            .then(([detail, created]) => {
                if (!created) res.send({success: false, message: 'Detail already exists'})
                else          res.send({success: true,  message: 'Detail saved'});
            })
            .catch(err => res.send({success: false, message: `Error saving detail: ${err.message}`}))
        };
    });
    app.put('/stores/sizes/:id',      pm, al('size_edit',    {send: true}), (req, res) => {
        m.stores.sizes.update(
            req.body.size,
            {where: {size_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Size saved'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/sizes/:id',   pm, al('size_delete',  {send: true}), (req, res) => {
        m.stores.stock.findOne({where: {size_id: req.params.id}})
        .then(stock => {
            if (stock) res.error.send('Cannot delete a size whilst it has stock', res)
            else {
                return m.stores.nsns.findOne({where: {size_id: req.params.id}})
                .then(nsn => {
                    if (nsn) res.error.send('Cannot delete a size whilst it has NSNs assigned', res)
                    else {
                        return m.stores.sizes.destroy({where: {size_id: req.params.id}})
                        .then(result => res.send({success: true, message: 'Size deleted'}))
                        .catch(err => res.error.send(err, res));
                    };
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/details/:id', pm, al('size_edit',  {send: true}), (req, res) => {
        m.stores.details.destroy({where: {detail_id: req.params.id}})
        .then(result => {
            if (!result) res.send({success: false, message: 'Detail not deleted'})
            else         res.send({success: true,  message: 'Detail deleted'})
        })
        .catch(err => res.send({success: false, message: `Error deleting detail: ${err.message}`}));
    });
};