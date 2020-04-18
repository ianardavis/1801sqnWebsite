module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    function itemOptions() {
        return [
            {table: 'categories'}, 
            {table: 'groups', include: m.categories}, 
            {table: 'types', include: m.groups}, 
            {table: 'subtypes', include: m.types}, 
            {table: 'genders'}
        ]
    };
    function nullify(item) {
        if (item.group_id === '')   item.group_id   = null;
        if (item.type_id === '')    item.type_id    = null;
        if (item.subtype_id === '') item.subtype_id = null;
        if (item.gender_id === '')  item.gender_id  = null;
        return item;
    };
    //INDEX
    app.get('/stores/items', isLoggedIn, allowed('access_items'), (req, res) => {
        fn.getOptions(itemOptions(), req)
        .then(classes => res.render('stores/items/index', {classes: classes}));
    });
    //NEW
    app.get('/stores/items/new', isLoggedIn, allowed('item_add'), (req, res) => {
        fn.getOptions(itemOptions(), req)
        .then(classes => res.render('stores/items/new', {classes: classes}))
    });
    //SHOW
    app.get('/stores/items/:id', isLoggedIn, allowed('access_items'), (req, res) => {
        let include = [
            m.genders, 
            m.categories, 
            m.groups, 
            m.types, 
            m.subtypes
        ];
        fn.getOne(
            m.items,
            {item_id: req.params.id},
            {include: include}
        )
        .then(item => {
            res.render('stores/items/show', {
                item:  item,
                notes: {table: 'items', id: item.item_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    //EDIT
    app.get('/stores/items/:id/edit', isLoggedIn, allowed('item_edit'), (req, res) => {
        fn.getOne(
            m.items,
            {item_id: req.params.id}
        )
        .then(item => {
            fn.getOptions(itemOptions(), req)
            .then(classes => {
                res.render('stores/items/edit', {
                    item:    item, 
                    classes: classes
                });
            });
        })
        .catch(err => fn.error(err, 'stores/items/' + req.params.id, req, res));
    });
    //ASYNC GET ITEMS
    app.get('/stores/getitems', isLoggedIn, allowed('access_issues', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.items,
            req.query
        )
        .then(items => res.send({result: true, items: items}))
        .catch(err => fn.send_error(err.message, res));
    });

    //POST
    app.post('/stores/items', isLoggedIn, allowed('item_add', {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        fn.create(
            m.items,
            req.body.item
        )
        .then(item => res.send({result: true, message: 'Item added'}))
        .catch(err => fn.send_error(err.message, res));
    });

    //PUT
    app.put('/stores/items/:id', isLoggedIn, allowed('item_edit', {send: true}), (req, res) => {
        req.body.item = nullify(req.body.item);
        fn.update(
            m.items,
            req.body.item,
            {item_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'Item saved'}))
        .catch(err => fn.send_error(err.message, res));
    });

    //DELETE
    app.delete('/stores/items/:id', isLoggedIn, allowed('item_delete', {send: true}), (req, res) => {
        fn.getOne(
            m.sizes,
            {item_id: req.params.id},
            {nullOK: true}
        )
        .then(sizes => {
            if (!sizes) {
                fn.delete(
                    'items',
                    {item_id: req.params.id}
                )
                .then(result => res.send({result: true, message: 'Item deleted'}))
                .catch(err => fn.send_error(err.message, res));
            } else fn.send_error('Cannot delete item while it has sizes assigned', res);
        })
        .catch(err => fn.send_error(err.message, res));
    });
};