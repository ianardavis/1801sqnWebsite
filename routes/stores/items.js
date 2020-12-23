module.exports = (app, allowed, inc, permissions, m) => {
    let nullify = require(`${process.env.ROOT}/fn/utils/nullify`);
    app.get('/stores/items',          permissions, allowed('access_items'),                    (req, res) => res.render('stores/items/index'));
    app.get('/stores/items/:id',      permissions, allowed('access_items'),                    (req, res) => res.render('stores/items/show'));
    
    app.get('/stores/get/items',      permissions, allowed('access_items',      {send: true}), (req, res) => {
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
    app.get('/stores/get/item',       permissions, allowed('access_items',      {send: true}), (req, res) => {
        m.items.findOne({
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
            if (item) res.send({result: true,  item: item})
            else      res.send({result: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/genders',    permissions, allowed('access_genders',    {send: true}), (req, res) => {
        m.genders.findAll({where: req.query})
        .then(genders => res.send({result: true, genders: genders}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/categories', permissions, allowed('access_categories', {send: true}), (req, res) => {
        m.categories.findAll({where: req.query})
        .then(categories => res.send({result: true, categories: categories}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/groups',     permissions, allowed('access_groups',     {send: true}), (req, res) => {
        m.groups.findAll({where: req.query})
        .then(groups => res.send({result: true, groups: groups}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/types',      permissions, allowed('access_types',      {send: true}), (req, res) => {
        m.types.findAll({where: req.query})
        .then(types => res.send({result: true, types: types}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/subtypes',   permissions, allowed('access_subtypes',   {send: true}), (req, res) => {
        m.subtypes.findAll({where: req.query})
        .then(subtypes => res.send({result: true, subtypes: subtypes}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/items',         permissions, allowed('item_add',          {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.create(req.body.item)
        .then(item => res.send({result: true, message: 'Item added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/items/:id',      permissions, allowed('item_edit',         {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.update(
            req.body.item,
            {where: {item_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'Item saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/items/:id',   permissions, allowed('item_delete',       {send: true}), (req, res) => {
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