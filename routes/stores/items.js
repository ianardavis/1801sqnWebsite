module.exports = (app, allowed, inc, permissions, m) => {
    let nullify = require(`../functions/nullify`);
    app.get('/stores/items',          permissions, allowed('access_items'),                    (req, res) => res.render('stores/items/index'));
    app.get('/stores/items/:id',      permissions, allowed('access_items'),                    (req, res) => res.render('stores/items/show'));
    
    app.get('/stores/get/items',      permissions, allowed('access_items',      {send: true}), (req, res) => {
        m.stores.items.findAll({
            where:   req.query,
            include: [
                inc.categories(),
                inc.groups(),
                inc.types(),
                inc.subtypes(),
                inc.genders()
            ]
        })
        .then(items => res.send({success: true, result: items}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/item',       permissions, allowed('access_items',      {send: true}), (req, res) => {
        m.stores.items.findOne({
            where:   req.query,
            include: [
                inc.categories(),
                inc.groups(),
                inc.types(),
                inc.subtypes(),
                inc.genders()
            ]
        })
        .then(item => {
            if (item) res.send({success: true,  result: item})
            else      res.send({success: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/genders',    permissions, allowed('access_genders',    {send: true}), (req, res) => {
        m.stores.genders.findAll({where: req.query})
        .then(genders => res.send({success: true, result: genders}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/categories', permissions, allowed('access_categories', {send: true}), (req, res) => {
        m.stores.categories.findAll({where: req.query})
        .then(categories => res.send({success: true, result: categories}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/groups',     permissions, allowed('access_groups',     {send: true}), (req, res) => {
        m.stores.groups.findAll({where: req.query})
        .then(groups => res.send({success: true, result: groups}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/types',      permissions, allowed('access_types',      {send: true}), (req, res) => {
        m.stores.types.findAll({where: req.query})
        .then(types => res.send({success: true, result: types}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/subtypes',   permissions, allowed('access_subtypes',   {send: true}), (req, res) => {
        m.stores.subtypes.findAll({where: req.query})
        .then(subtypes => res.send({success: true, result: subtypes}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/items',         permissions, allowed('item_add',          {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.stores.items.create(req.body.item)
        .then(item => res.send({success: true, message: 'Item added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/items/:id',      permissions, allowed('item_edit',         {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.stores.items.update(
            req.body.item,
            {where: {item_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Item saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/items/:id',   permissions, allowed('item_delete',       {send: true}), (req, res) => {
        m.stores.sizes.findOne({where: {item_id: req.params.id}})
        .then(sizes => {
            if (!sizes) {
                m.stores.items.destroy({where: {item_id: req.params.id}})
                .then(result => res.send({success: true, message: 'Item deleted'}))
                .catch(err => res.error.send(err, res));
            } else res.error.send('Cannot delete item while it has sizes assigned', res);
        })
        .catch(err => res.error.send(err, res));
    });
};