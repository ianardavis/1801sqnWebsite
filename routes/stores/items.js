module.exports = (app, m, pm, op, inc, send_error) => {
    let nullify = require(`../functions/nullify`);
    app.get('/items',        pm.get, pm.check('access_items'),               (req, res) => res.render('stores/items/index'));
    app.get('/items/:id',    pm.get, pm.check('access_items'),               (req, res) => res.render('stores/items/show'));
    
    app.get('/get/items',              pm.check('access_items', {send: true}), (req, res) => {
        m.items.findAll({
            where:   req.query,
            include: [
                // inc.categories(),
                inc.genders()
            ]
        })
        .then(items => res.send({success: true, result: items}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/item',               pm.check('access_items', {send: true}), (req, res) => {
        m.items.findOne({
            where:   req.query,
            include: [
                // inc.categories(),
                inc.genders()
            ]
        })
        .then(item => {
            if (item) res.send({success: true,  result: item})
            else      res.send({success: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/item_categories',    pm.check('access_items', {send: true}), (req, res) => {
        m.item_categories.findAll({
            where: req.query,
            include: [inc.categories()]
        })
        .then(categories => res.send({success: true, result: categories}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/item_category',      pm.check('access_items', {send: true}), (req, res) => {
        m.item_categories.findOne({
            where: req.query,
            include: [inc.categories()]
        })
        .then(category => res.send({success: true, result: category}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/items',                 pm.check('item_add',     {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.create(req.body.item)
        .then(item => res.send({success: true, message: 'Item added'}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/item_categories',       pm.check('item_edit',    {send: true}), (req, res) => {
        let actions = [];
        req.body.category.category_id.filter(e => e !== '').forEach(category_id => {
            actions.push(new Promise((resolve, reject) => {
                return m.item_categories.findOrCreate({
                    where: {
                        item_id:     req.body.category.item_id,
                        category_id: category_id
                    }
                })
                .then(([category, created]) => resolve(true))
                .catch(err => reject(err));
            }));
        });
        Promise.allSettled(actions)
        .then(results => res.send({success: true, message: 'Categories added'}))
        .catch(err => res.send({success: false, message: `Error adding categories: ${err.message}`}));
    });
    app.put('/items/:id',              pm.check('item_edit',    {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.update(
            req.body.item,
            {where: {item_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Item saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/items/:id',           pm.check('item_delete',  {send: true}), (req, res) => {
        m.sizes.findOne({where: {item_id: req.params.id}})
        .then(sizes => {
            if (!sizes) {
                m.items.destroy({where: {item_id: req.params.id}})
                .then(result => res.send({success: true, message: 'Item deleted'}))
                .catch(err => {
                    if (!result) res.send({success: false, message: 'Item not deleted'})
                    else         res.send({success: true,  message: 'Item deleted'});
                });
            } else res.send({success: false, message: 'Cannot delete item while it has sizes assigned'});
        })
        .catch(err => res.send({success: false, message: `Error deleting item: ${err.message}`}));
    });
    app.delete('/item_categories/:id', pm.check('item_edit',    {send: true}), (req, res) => {
        m.item_categories.destroy({where: {item_category_id: req.params.id}})
        .then(result => {
            if (!result) res.send({success: false, message: 'Category not deleted'})
            else         res.send({success: true,  message: 'Category deleted'});
        })
        .catch(err => res.send({success: false, message: `Error deleting category: ${err.message}`}));
    });
};