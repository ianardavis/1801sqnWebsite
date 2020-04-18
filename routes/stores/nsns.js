module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //NEW
    app.get('/stores/nsns/new', isLoggedIn, allowed('nsn_add'), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.query.size_id},
            {include: [m.items]}
        )
        .then(itemsize => res.render('stores/nsns/new', {itemsize: itemsize}))
        .catch(err => fn.error(err, '/stores/sizes/' + req.query.size_id, req, res));
    });
    //SHOW
    app.get('/stores/nsns/:id', isLoggedIn, allowed('nsn_edit'), (req, res) => {
        fn.getOne(
            m.nsns,
            {nsn_id: req.params.id},
            {include: [inc.sizes()]}
        )
        .then(nsn => {
            res.render('stores/nsns/show', {
                nsn:   nsn,
                notes: {table: 'nsns', id: nsn.nsn_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => fn.error(err, '/', req, res));
    });
    //EDIT
    app.get('/stores/nsns/:id/edit', isLoggedIn, allowed('nsn_edit'), (req, res) => {
        fn.getOne(
            m.nsns,
            {nsn_id: req.params.id},
            {include: [inc.sizes()]}
        )
        .then(nsn => res.render('stores/nsns/edit', {nsn: nsn}))
        .catch(err => fn.error(err, '/', req, res));
    });
    //ASYNC GET
    app.get('/stores/getnsns', isLoggedIn, allowed('access_nsns', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.nsns,
            req.query
        )
        .then(nsns => res.send({result: true, nsns: nsns}))
        .catch(err => fn.send_error(err.message, res));
    });
    
    //POST
    app.post('/stores/nsns', isLoggedIn, allowed('nsn_add', {send: true}), (req, res) => {
        fn.create(
            m.nsns,
            req.body.nsn
        )
        .then(nsn => {
            if (req.body.default) {
                fn.update(
                    m.sizes,
                    {nsn_id: nsn.nsn_id},
                    {size_id: nsn.size_id}
                )
                .then(result => res.send({result: true, message: 'NSN added as default'}))
                .catch(err => fn.send_error(err.message, res));
            } else res.send({result: true, message: 'NSN added'});
        })
        .catch(err => fn.send_error(err.message, res));
    });

    //PUT
    app.put('/stores/nsns/:id', isLoggedIn, allowed('nsn_edit', {send: true}), (req, res) => {
        let actions = [];
        actions.push(
            fn.update(
                m.nsns,
                req.body.nsn,
                {nsn_id: req.params.id}
            )
        );
        if (req.body.default && Number(req.body.currentDefault) !== Number(req.params.id)) {
            actions.push(
                fn.update(
                    m.sizes,
                    {nsn_id: req.params.id},
                    {size_id: req.body.size_id}
                )
            );
        } else if (Number(req.body.currentDefault) === Number(req.params.id)) {
            actions.push(
                fn.update(
                    m.sizes,
                    {nsn_id: null},
                    {size_id: req.body.size_id}
                )
            );
        };
        Promise.allSettled(actions)
        .then(result => res.send({result: true, message: 'NSN saved'}))
        .catch(err => fn.send_error(err.message, res));
    });

    //DELETE
    app.delete('/stores/nsns/:id', isLoggedIn, allowed('nsn_delete', {send: true}), (req, res) => {
        fn.delete(
            'nsns', 
            {nsn_id: req.params.id}
        )
        .then(result => {
            fn.update(
                m.sizes,
                {nsn_id: null},
                {nsn_id: req.params.id},
                true
            )
            .then(result => res.send({result: true, message: 'NSN deleted'}))
            .catch(err => fn.send_error(err.message, res));
        })
        .catch(err => fn.send_error(err.message, res));
    });
};
