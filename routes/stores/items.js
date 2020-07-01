module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db      = require(process.env.ROOT + '/fn/db'),
        options = require(process.env.ROOT + '/fn/options');
    nullify = item => {
        if (item.subtype_id === '') item.subtype_id = null;
        if (item.gender_id === '')  item.gender_id  = null;
        if (item.group_id === '')   item.group_id   = null;
        if (item.type_id === '')    item.type_id    = null;
        return item;
    };
    
    app.get('/stores/items',          isLoggedIn, allowed('access_items'),                (req, res) => res.render('stores/items/index'));
    app.get('/stores/items/new',      isLoggedIn, allowed('item_add'),                    (req, res) => res.render('stores/items/new'));
    app.get('/stores/items/:id',      isLoggedIn, allowed('access_items'),                (req, res) => {
        let include = [
            m.genders, 
            m.categories, 
            m.groups, 
            m.types, 
            m.subtypes
        ];
        db.findOne({
            table: m.items,
            where: {item_id: req.params.id},
            include: include
        })
        .then(item => {
            res.render('stores/items/show', {
                item:  item,
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/items/:id/edit', isLoggedIn, allowed('item_edit'),                   (req, res) => {
        db.findOne({
            table: m.items,
            where: {item_id: req.params.id}
        })
        .then(item => res.render('stores/items/edit', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/items',      isLoggedIn, allowed('access_issues', {send: true}), (req, res) => {
        m.items.findAll({where: req.query})
        .then(items => res.send({result: true, items: items}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/items',         isLoggedIn, allowed('item_add',      {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        m.items.create(req.body.item)
        .then(item => res.send({result: true, message: 'Item added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/items/:id',      isLoggedIn, allowed('item_edit',     {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        db.update({
            table: m.items,
            where: {item_id: req.params.id},
            record: req.body.item
        })
        .then(result => res.send({result: true, message: 'Item saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/items/:id',   isLoggedIn, allowed('item_delete',   {send: true}), (req, res) => {
        m.sizes.findOne({where: {item_id: req.params.id}})
        .then(sizes => {
            if (!sizes) {
                db.destroy({
                    table: m.items,
                    where: {item_id: req.params.id}
                })
                .then(result => res.send({result: true, message: 'Item deleted'}))
                .catch(err => res.error.send(err, res));
            } else res.error.send('Cannot delete item while it has sizes assigned', res);
        })
        .catch(err => res.error.send(err, res));
    });
};