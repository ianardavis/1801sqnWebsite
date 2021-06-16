module.exports = (app, m, inc, fn) => {
    app.get('/nsns/:id',          fn.loggedIn(), fn.permissions.get('access_nsns'),   (req, res) => res.render('stores/nsns/show'));
    app.get('/get/nsns',          fn.loggedIn(), fn.permissions.check('access_nsns'), (req, res) => {
        m.nsns.findAll({
            where: req.query,
            include: [
                inc.nsn_group(),
                inc.nsn_class(),
                inc.nsn_country(),
                inc.size({attributes: ['nsn_id']})
            ]
        })
        .then(nsns => res.send({success: true, result: nsns}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/nsn',           fn.loggedIn(), fn.permissions.check('access_nsns'), (req, res) => {
        fn.get(
            'nsns',
            req.query,
            [
                inc.nsn_group(),
                inc.nsn_class(),
                inc.nsn_country(),
                inc.size({attributes: ['nsn_id']})
            ]
        )
        .then(nsn => res.send({success: true, result: nsn}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/nsn_groups',    fn.loggedIn(), fn.permissions.check('access_nsns'), (req, res) => {
        m.nsn_groups.findAll({where: req.query})
        .then(nsn_groups => res.send({success: true, result: nsn_groups}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/nsn_classes',   fn.loggedIn(), fn.permissions.check('access_nsns'), (req, res) => {
        if (req.query.nsn_group_id === '') req.query.nsn_group_id = null;
        m.nsn_classes.findAll({where: req.query})
        .then(nsn_classes => res.send({success: true, result: nsn_classes}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/nsn_countries', fn.loggedIn(), fn.permissions.check('access_nsns'), (req, res) => {
        m.nsn_countries.findAll({where: req.query})
        .then(nsn_countries => res.send({success: true, result: nsn_countries}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/nsns',             fn.loggedIn(), fn.permissions.check('nsn_add'),     (req, res) => {
        fn.get(
            'sizes',
            {size_id: req.body.nsn.size_id}
        )
        .then(size => {
            return fn.get(
                'nsn_groups',
                {nsn_group_id: req.body.nsn.nsn_group_id}
            )
            .then(nsn_group => {
                return fn.get(
                    'nsn_classes',
                    {nsn_class_id: req.body.nsn.nsn_class_id}
                )
                .then(nsn_class => {
                    return fn.get(
                        'nsn_countries',
                        {nsn_country_id: req.body.nsn.nsn_country_id}
                    )
                    .then(nsn_country => {
                        return m.nsns.findOrCreate({
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
                                return size.update({nsn_id: nsn.nsn_id})
                                .then(result => {
                                    if (!result) res.send({success: true,  message: `NSN added. Default not set`})
                                    else res.send({success: true,  message: `NSN added and set to default`});
                                })
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
    
    app.put('/nsns/:id',          fn.loggedIn(), fn.permissions.check('nsn_edit'),    (req, res) => {
        fn.get(
            'nsns',
            {nsn_id: req.params.id},
            [inc.size()]
        )
        .then(nsn => {
            return fn.get(
                'nsn_groups',
                {nsn_group_id: req.body.nsn.nsn_group_id}
            )
            .then(nsn_group => {
                return fn.get(
                    'nsn_classes',
                    {nsn_class_id: req.body.nsn.nsn_class_id}
                )
                .then(nsn_class => {
                    return fn.get(
                        'nsn_countries',
                        {nsn_country_id: req.body.nsn.nsn_country_id}
                    )
                    .then(nsn_country => {
                        return nsn.update({
                            nsn_group_id:   nsn_group  .nsn_group_id,
                            nsn_class_id:   nsn_class  .nsn_class_id,
                            nsn_country_id: nsn_country.nsn_country_id,
                            item_number:    req.body.nsn.item_number
                        })
                        .then(result => {
                            if (!result) fn.send_error(res, 'NSN not updated')
                            else res.send({success: true, message: 'NSN saved'});
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
    
    app.delete('/nsns/:id',       fn.loggedIn(), fn.permissions.check('nsn_delete'),  (req, res) => {
        fn.get(
            'nsns',
            {nsn_id: req.params.id}
        )
        .then(nsn => {
            return m.action_links.findOne({
                where: {
                    _table: 'nsns',
                    id: nsn.nsn_id
                }
            })
            .then(action => {
                if (action) fn.send_error(res, 'NSN has actions and cannot be deleted')
                else {
                    return m.loancard_lines.findOne({
                        where: {nsn_id: nsn.nsn_id}
                    })
                    .then(line => {
                        if (line) fn.send_error(res, 'NSN has loancards and cannot be deleted')
                        else {
                            return nsn.destroy()
                            .then(result => {
                                return m.sizes.update(
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