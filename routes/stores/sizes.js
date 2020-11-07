const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/sizes/new',      isLoggedIn, allowed('size_add'),                  (req, res) => {
        db.findOne({
            table: m.items,
            where: {item_id: req.query.item_id}
        })
        .then(item => res.render('stores/sizes/new', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/sizes/:id',      isLoggedIn, allowed('access_sizes'),              (req, res) => res.render('stores/sizes/show', {tab:  req.query.tab || 'details'}));
    app.get('/stores/sizes/:id/edit', isLoggedIn, allowed('size_edit'),                 (req, res) => res.render('stores/sizes/edit'));

    app.post('/stores/sizes',         isLoggedIn, allowed('size_add',    {send: true}), (req, res) => {
        req.body.size._ordering_details = req.body.size._ordering_details.trim()
        req.body.size = db.nullify(req.body.size);
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
    app.put('/stores/sizes/:id',      isLoggedIn, allowed('size_edit',   {send: true}), (req, res) => {
        db.update({
            table: m.sizes,
            where: {size_id: req.params.id},
            record: req.body.size
        })
        .then(result => res.send({result: true, message: 'Size saved'}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/sizes/:id',   isLoggedIn, allowed('size_delete', {send: true}), (req, res) => {
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