module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/nsns',          pm.check('access_nsns', {send: true}), (req, res) => {
        m.nsns.findAll({
            where: req.query,
            include: [
                inc.nsn_groups(),
                inc.nsn_classes(),
                inc.nsn_countries(),
                inc.sizes({attributes: ['nsn_id']})
            ]
        })
        .then(nsns => res.send({success: true, result: nsns}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/nsn',           pm.check('access_nsns', {send: true}), (req, res) => {
        m.nsns.findOne({
            where: req.query,
            include: [
                inc.nsn_groups(),
                inc.nsn_classes(),
                inc.nsn_countries(),
                inc.sizes({attributes: ['nsn_id']})
            ]
        })
        .then(nsn => {
            if (nsn) res.send({success: true, result: nsn})
            else     res.send({success: false, message: 'NSN not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/nsn_groups',    pm.check('access_nsns', {send: true}), (req, res) => {
        m.nsn_groups.findAll({
            where: req.query
        })
        .then(nsn_groups => res.send({success: true, result: nsn_groups}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/nsn_classes',   pm.check('access_nsns', {send: true}), (req, res) => {
        m.nsn_classes.findAll({
            where: req.query
        })
        .then(nsn_classes => res.send({success: true, result: nsn_classes}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/nsn_countries', pm.check('access_nsns', {send: true}), (req, res) => {
        m.nsn_countries.findAll({
            where: req.query
        })
        .then(nsn_countries => res.send({success: true, result: nsn_countries}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/nsns',             pm.check('nsn_add',     {send: true}), (req, res) => {
        m.nsns.findOrCreate({
            where: {
                nsn_group_id: req.body.nsn.nsn_group_id,
                nsn_class_id: req.body.nsn.nsn_class_id,
                nsn_country_id: req.body.nsn.nsn_country_id,
                _item_number: req.body.nsn._item_number
            },
            defaults: {size_id: req.body.nsn.size_id}
        })
        .then(([nsn, created]) => {
            if (!created) res.send({success: false, message: 'NSN already exists'})
            else          res.send({success: true,  message: 'NSN added'});
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.put('/nsns',              pm.check('nsn_edit',    {send: true}), (req, res) => {
        if (!req.body.nsn_id) res.send({success: false, message: 'No NSN ID provided'})
        else {
            m.nsns.findOne({where: {nsn_id: req.body.nsn_id}})
            .then(nsn => {
                if (!nsn) res.send({success: false, message: 'NSN not found'})
                else {
                    return nsn.update(req.body.nsn)
                    .then(result => res.send({success: true, message: 'NSN saved'}))
                    .catch(err => res.error.send(err, res));
                };
            })
            .catch(err => res.error.send(err, res));
        };
    });
    
    app.delete('/nsns/:id',       pm.check('nsn_delete',  {send: true}), (req, res) => {
        m.nsns.findOne({
            where: {nsn_id: req.params.id},
            attributes: ['nsn_id']
        })
        .then(nsn => {
            if (!nsn) res.send({success: false, message: 'NSN not found'})
            else {
                return nsn.destroy()
                .then(result => {
                    m.sizes.update(
                        {nsn_id: null},
                        {where: {nsn_id: req.params.id}}
                    )
                    .then(result => res.send({success: true, message: 'NSN deleted'}))
                    .catch(err => res.error.send(err, res));
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};