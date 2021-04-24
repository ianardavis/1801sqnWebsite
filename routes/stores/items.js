module.exports = (app, m, pm, op, inc, li, send_error) => {
    let nullify = require(`../functions/nullify`);
    app.get('/items',                  li, pm.get, pm.check('access_items'),               (req, res) => res.render('stores/items/index'));
    app.get('/items/:id',              li, pm.get, pm.check('access_items'),               (req, res) => res.render('stores/items/show'));
    
    app.get('/get/items',              li,         pm.check('access_items', {send: true}), (req, res) => {
        m.items.findAll({
            where:   req.query,
            include: [inc.genders()]
        })
        .then(items => res.send({success: true, result: items}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/item',               li,         pm.check('access_items', {send: true}), (req, res) => {
        m.items.findOne({
            where:   req.query,
            include: [inc.genders()]
        })
        .then(item => {
            if (item) res.send({success: true, result: item})
            else send_error(res, 'Item not found');
        })
        .catch(err => send_error(res, err));
    });
    app.get('/get/item_categories',    li,         pm.check('access_items', {send: true}), (req, res) => {
        m.item_categories.findAll({
            where:   req.query,
            include: [inc.categories()]
        })
        .then(categories => res.send({success: true, result: categories}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/item_category',      li,         pm.check('access_items', {send: true}), (req, res) => {
        m.item_categories.findOne({
            where:   req.query,
            include: [inc.categories()]
        })
        .then(category => res.send({success: true, result: category}))
        .catch(err => send_error(res, err));
    });

    app.post('/items',                 li,         pm.check('item_add',     {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.create(req.body.item)
        .then(item => res.send({success: true, message: 'Item added'}))
        .catch(err => send_error(res, err));
    });
    app.post('/item_categories',       li,         pm.check('item_edit',    {send: true}), (req, res) => {
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
        .catch(err => send_error(res, err));
    });
    app.put('/items/:id',              li,         pm.check('item_edit',    {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.update(
            req.body.item,
            {where: {item_id: req.params.id}}
        )
        .then(result => res.send({success: true, message: 'Item saved'}))
        .catch(err => send_error(res, err));
    });
    app.delete('/items/:id',           li,         pm.check('item_delete',  {send: true}), (req, res) => {
        m.sizes.findOne({where: {item_id: req.params.id}})
        .then(sizes => {
            if (sizes) send_error(res, 'Cannot delete item while it has sizes assigned')
            else {
                return m.items.destroy({where: {item_id: req.params.id}})
                .then(result => {
                    if (!result) send_error(res, 'Item not deleted')
                    else res.send({success: true, message: 'Item deleted'});
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
    app.delete('/item_categories/:id', li,         pm.check('item_edit',    {send: true}), (req, res) => {
        m.item_categories.destroy({where: {item_category_id: req.params.id}})
        .then(result => {
            if (!result) send_error(res, 'Category not deleted')
            else res.send({success: true, message: 'Category deleted'});
        })
        .catch(err => send_error(res, err));
    });
};