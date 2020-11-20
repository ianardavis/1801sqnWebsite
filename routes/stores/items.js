module.exports = (app, allowed, inc, permissions, m) => {
    let utils = require(process.env.ROOT + '/fn/utils');
    
    app.get('/stores/items',          permissions, allowed('access_items'),               (req, res) => res.render('stores/items/index'));
    app.get('/stores/items/new',      permissions, allowed('item_add'),                   (req, res) => res.render('stores/items/new'));
    app.get('/stores/items/:id',      permissions, allowed('access_items'),               (req, res) => res.render('stores/items/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/items/:id/edit', permissions, allowed('item_edit'),                  (req, res) => {
        m.items.findOne({where: {item_id: req.params.id}})
        .then(item => res.render('stores/items/edit', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/items',      permissions, allowed('access_items', {send: true}), (req, res) => {
        m.items.findAll({
            where:   req.query,
            include: [
                inc.categories(),
                inc.groups(),
                inc.types(),
                inc.subtypes(),
                inc.genders()
            ]
        })
        .then(items => res.send({result: true, items: items}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/items',         permissions, allowed('item_add',     {send: true}), (req, res) => {
        req.body.item = utils.nullify(req.body.item);
        m.items.create(req.body.item)
        .then(item => res.send({result: true, message: 'Item added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/items/:id',      permissions, allowed('item_edit',    {send: true}), (req, res) => {
        req.body.item = utils.nullify(req.body.item);
        m.items.update(
            req.body.item,
            {where: {item_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'Item saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/items/:id',   permissions, allowed('item_delete',  {send: true}), (req, res) => {
        m.sizes.findOne({where: {item_id: req.params.id}})
        .then(sizes => {
            if (!sizes) {
                m.items.destroy({where: {item_id: req.params.id}})
                .then(result => res.send({result: true, message: 'Item deleted'}))
                .catch(err => res.error.send(err, res));
            } else res.error.send('Cannot delete item while it has sizes assigned', res);
        })
        .catch(err => res.error.send(err, res));
    });
};