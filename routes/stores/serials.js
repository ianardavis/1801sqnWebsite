module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //NEW
    app.get('/stores/serials/new', isLoggedIn, allowed('serial_add'), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.query.size_id},
            {include: [m.items]}
        )
        .then(itemsize => res.render('stores/serials/new', {itemsize: itemsize}))
        .catch(err => fn.error(err, '/stores/sizes/' + req.query.size_id, req, res));
    });
    //SHOW
    app.get('/stores/serials/:id', isLoggedIn, allowed('serial_edit'), (req, res) => {
        fn.getOne(
            m.serials,
            {serial_id: req.params.id}
        )
        .then(serial => {
            res.render('stores/serials/show', {
                serial:   serial,
                notes:    {table: 'serials', id: serial.serial_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => fn.error(err, '/', req, res));
    });
    //EDIT
    app.get('/stores/serials/:id/edit', isLoggedIn, allowed('serial_edit'), (req, res) => {
        fn.getOne(
            m.serials,
            {serial_id: req.params.id},
            {include: [inc.sizes()]}
        )
        .then(serial => {
            fn.getNotes('serials', req.params.id, req)
            .then(notes => {
                res.render('stores/serials/edit', {
                    serial: serial,
                    notes:  notes,
                    query:  {system: req.query.system || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    //ASYNC GET
    app.get('/stores/getserials', isLoggedIn, allowed('access_serials', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.serials,
            req.query
        )
        .then(serials => res.send({result: true, serials: serials}))
        .catch(err => fn.send_error(err.message, res));
    });

    //POST
    app.post('/stores/serials', isLoggedIn, allowed('serial_add', {send: true}), (req, res) => {
        fn.create(
            m.serials,
            req.body.serial
        )
        .then(serial => res.send({result: true, message: 'Serial added'}))
        .catch(err => fn.send_error(err.message, res));
    });

    //PUT
    app.put('/stores/serials/:id', isLoggedIn, allowed('serial_edit', {send: true}), (req, res) => {
        fn.update(
            m.serials,
            req.body.serial,
            {serial_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'Serial # saved'}))
        .catch(err => fn.send_error(err.message, res));
    });
    
    //DELETE
    app.delete('/stores/serials/:id', isLoggedIn, allowed('serial_delete', {send: true}), (req, res) => {
        fn.delete(
            'serials', 
            {serial_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'Serial deleted'}))
        .catch(err => fn.send_error(err.message, res));
    });
};
