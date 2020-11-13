module.exports = (app, allowed, inc, isLoggedIn, m) => {
    nullify = item => {
        if (item.subtype_id === '') item.subtype_id = null;
        if (item.gender_id === '')  item.gender_id  = null;
        if (item.group_id === '')   item.group_id   = null;
        if (item.type_id === '')    item.type_id    = null;
        return item;
    };
    
    app.get('/stores/items',          isLoggedIn, allowed('access_items'),              (req, res) => res.render('stores/items/index'));
    app.get('/stores/items/new',      isLoggedIn, allowed('item_add'),                  (req, res) => res.render('stores/items/new'));
    app.get('/stores/items/:id',      isLoggedIn, allowed('access_items'),              (req, res) => res.render('stores/items/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/items/:id/edit', isLoggedIn, allowed('item_edit'),                 (req, res) => {
        m.items.findOne({where: {item_id: req.params.id}})
        .then(item => res.render('stores/items/edit', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.post('/stores/items',         isLoggedIn, allowed('item_add',    {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.create(req.body.item)
        .then(item => res.send({result: true, message: 'Item added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/items/:id',      isLoggedIn, allowed('item_edit',   {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.update(
            req.body.item,
            {where: {item_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'Item saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/items/:id',   isLoggedIn, allowed('item_delete', {send: true}), (req, res) => {
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