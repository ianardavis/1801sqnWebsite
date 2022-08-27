module.exports = (app, m, fn) => {
    app.get('/nsns/:id',          fn.loggedIn(), fn.permissions.get('access_stores'),   (req, res) => res.render('stores/nsns/show'));
    app.get('/get/nsns',          fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        m.nsns.findAndCountAll({
            where: req.query.where,
            include: [
                fn.inc.stores.nsn_group(),
                fn.inc.stores.nsn_class(),
                fn.inc.stores.nsn_country(),
                fn.inc.stores.size()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('nsns', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/nsn',           fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        m.nsns.findOne({
            where: req.query.where,
            include: [
                fn.inc.stores.nsn_group(),
                fn.inc.stores.nsn_class(),
                fn.inc.stores.nsn_country(),
                fn.inc.stores.size()
            ]
        })
        .then(nsn => {
            if (nsn) res.send({success: true, result: nsn})
            else res.send({success: false, message: 'NSN not found'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/nsn_groups',    fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        m.nsn_groups.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('nsn_groups', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/nsn_classes',   fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        if (req.query.nsn_group_id === '') req.query.nsn_group_id = null;
        m.nsn_classes.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('nsn_classes', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/nsn_countries', fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        m.nsn_countries.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('nsn_countries', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/nsns',             fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.sizes.get(req.body.nsn.size_id)
        .then(size => {
            fn.nsns.groups.get(req.body.nsn.nsn_group_id)
            .then(nsn_group => {
                fn.nsns.classes.get(req.body.nsn.nsn_class_id)
                .then(nsn_class => {
                    fn.nsns.countries.get(req.body.nsn.nsn_country_id)
                    .then(nsn_country => {
                        m.nsns.findOrCreate({
                            where: {
                                nsn_group_id:   nsn_group.nsn_group_id,
                                nsn_class_id:   nsn_class.nsn_class_id,
                                nsn_country_id: nsn_country.nsn_country_id,
                                item_number:    req.body.nsn.item_number
                            },
                            defaults: {size_id: req.body.nsn.size_id}
                        })
                        .then(([nsn, created]) => {
                            if (!created) fn.send_error(res, 'NSN already exists')
                            else if (req.body.default === '1') {
                                fn.update(size, {nsn_id: nsn.nsn_id})
                                .then(result => res.send({success: true,  message: `NSN added and set to default`}))
                                .catch(err => {
                                    console.log(err);
                                    res.send({success: true,  message: `NSN added, error setting as default: ${err.message}`});
                                })
                            } else res.send({success: true,  message: 'NSN added'});
                        })
                        .catch(err => fn.send_error(res, err));
                    })
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/nsns/:id',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.nsns.get(req.params.id)
        .then(nsn => {
            fn.nsns.groups.get(req.body.nsn.nsn_group_id)
            .then(nsn_group => {
                fn.nsns.classes.get(req.body.nsn.nsn_class_id)
                .then(nsn_class => {
                    fn.nsns.countries.get(req.body.nsn.nsn_country_id)
                    .then(nsn_country => {
                        fn.update(nsn, {
                            nsn_group_id:   nsn_group  .nsn_group_id,
                            nsn_class_id:   nsn_class  .nsn_class_id,
                            nsn_country_id: nsn_country.nsn_country_id,
                            item_number:    req.body.nsn.item_number
                        })
                        .then(result => res.send({success: true, message: 'NSN saved'}))
                        .catch(err => fn.send_error(res, err));
                    })
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/nsns/:id',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.nsns.get(req.params.id)
        .then(nsn => {
            m.action_links.findOne({
                where: {
                    _table: 'nsns',
                    id: nsn.nsn_id
                }
            })
            .then(action => {
                if (action) fn.send_error(res, 'NSN has actions and cannot be deleted')
                else {
                    m.loancard_lines.findOne({
                        where: {nsn_id: nsn.nsn_id}
                    })
                    .then(line => {
                        if (line) fn.send_error(res, 'NSN has loancards and cannot be deleted')
                        else {
                            nsn.destroy()
                            .then(result => {
                                m.sizes.update(
                                    {nsn_id: null},
                                    {where: {nsn_id: req.params.id}}
                                )
                                .then(result => res.redirect(`/sizes/${nsn.size_id}`))
                                .catch(err => fn.send_error(res, err));
                            })
                            .catch(err => fn.send_error(res, err));
                        };
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};