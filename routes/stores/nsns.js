module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/nsns/:id',          li, pm.get('access_nsns'),   (req, res) => res.render('stores/nsns/show'));
    app.get('/get/nsns',          li, pm.check('access_nsns'), (req, res) => {
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
        .catch(err => send_error(res, err));
    });
    app.get('/get/nsn',           li, pm.check('access_nsns'), (req, res) => {
        m.nsns.findOne({
            where: req.query,
            include: [
                inc.nsn_group(),
                inc.nsn_class(),
                inc.nsn_country(),
                inc.size({attributes: ['nsn_id']})
            ]
        })
        .then(nsn => {
            if (nsn) res.send({success: true, result: nsn})
            else     send_error(res, 'NSN not found');
        })
        .catch(err => send_error(res, err));
    });
    app.get('/get/nsn_groups',    li, pm.check('access_nsns'), (req, res) => {
        m.nsn_groups.findAll({where: req.query})
        .then(nsn_groups => res.send({success: true, result: nsn_groups}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/nsn_classes',   li, pm.check('access_nsns'), (req, res) => {
        if (req.query.nsn_group_id === '') req.query.nsn_group_id = null;
        m.nsn_classes.findAll({where: req.query})
        .then(nsn_classes => res.send({success: true, result: nsn_classes}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/nsn_countries', li, pm.check('access_nsns'), (req, res) => {
        m.nsn_countries.findAll({where: req.query})
        .then(nsn_countries => res.send({success: true, result: nsn_countries}))
        .catch(err => send_error(res, err));
    });

    app.post('/nsns',             li, pm.check('nsn_add'),     (req, res) => {
        m.sizes.findOne({
            where: {size_id: req.body.nsn.size_id},
            attributes: ['size_id', 'nsn_id']
        })
        .then(size => {
            if (!size) send_error(res, 'Size not found')
            else {
                return m.nsn_groups.findOne({
                    where: {nsn_group_id: req.body.nsn.nsn_group_id},
                    attributes: ['nsn_group_id']
                })
                .then(nsn_group => {
                    if (!nsn_group) send_error(res, 'Group not found')
                    else {
                        return m.nsn_classes.findOne({
                            where: {nsn_class_id: req.body.nsn.nsn_class_id},
                            attributes: ['nsn_class_id']
                        })
                        .then(nsn_class => {
                            if (!nsn_class) send_error(res, 'Class not found')
                            else {
                                return m.nsn_countries.findOne({
                                    where: {nsn_country_id: req.body.nsn.nsn_country_id},
                                    attributes: ['nsn_country_id']
                                })
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
                                        if (!created) send_error(res, 'NSN already exists')
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
                                    .catch(err => send_error(res, err));
                                })
                                .catch(err => send_error(res, err));
                            };
                        })
                        .catch(err => send_error(res, err));
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
    
    app.put('/nsns/:id',          li, pm.check('nsn_edit'),    (req, res) => {
        m.nsns.findOne({
            where: {nsn_id: req.params.id},
            include: [inc.size({attributes: ['size_id', 'nsn_id']})]
        })
        .then(nsn => {
            if (!nsn) send_error(res, 'NSN not found')
            else {
                return m.nsn_groups.findOne({where: {nsn_group_id: req.body.nsn.nsn_group_id}})
                .then(nsn_group => {
                    if (!nsn_group) send_error(res, 'NSN group not found')
                    else {
                        return m.nsn_classes.findOne({where: {nsn_class_id: req.body.nsn.nsn_class_id}})
                        .then(nsn_class => {
                            if (!nsn_class) send_error(res, 'NSN class not found')
                            else {
                                return m.nsn_countries.findOne({where: {nsn_country_id: req.body.nsn.nsn_country_id}})
                                .then(nsn_country => {
                                    if (!nsn_country) send_error(res, 'NSN country not found')
                                    else {
                                        return nsn.update({
                                            nsn_group_id:   nsn_group  .nsn_group_id,
                                            nsn_class_id:   nsn_class  .nsn_class_id,
                                            nsn_country_id: nsn_country.nsn_country_id,
                                            item_number:    req.body.nsn.item_number
                                        })
                                        .then(result => {
                                            if (!result) send_error(res, 'NSN not updated')
                                            else res.send({success: true, message: 'NSN saved'});
                                        })
                                        .catch(err => send_error(res, err));
                                    };
                                })
                                .catch(err => send_error(res, err));
                            };
                        })
                        .catch(err => send_error(res, err));
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
    
    app.delete('/nsns/:id',       li, pm.check('nsn_delete'),  (req, res) => {
        m.nsns.findOne({
            where:      {nsn_id: req.params.id},
            attributes: ['nsn_id', 'size_id']
        })
        .then(nsn => {
            if (!nsn) send_error(res, 'NSN not found')
            else {
                return m.actions.findOne({
                    where: {nsn_id: nsn.nsn_id}
                })
                .then(action => {
                    if (action) send_error(res, 'NSN has actions and cannot be deleted')
                    else {
                        return m.loancard_lines.findOne({
                            where: {nsn_id: nsn.nsn_id}
                        })
                        .then(line => {
                            if (line) send_error(res, 'NSN has loancards and cannot be deleted')
                            else {
                                return nsn.destroy()
                                .then(result => {
                                    return m.sizes.update(
                                        {nsn_id: null},
                                        {where: {nsn_id: req.params.id}}
                                    )
                                    .then(result => res.redirect(`/sizes/${nsn.size_id}`))
                                    .catch(err => send_error(res, err));
                                })
                                .catch(err => send_error(res, err));
                            };
                        })
                        .catch(err => send_error(res, err));
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};