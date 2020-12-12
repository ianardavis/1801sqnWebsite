module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/stores/nsns/:id',                permissions, allowed('access_nsns'),               (req, res) => res.render('stores/nsns/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/nsns/:id/edit',           permissions, allowed('nsn_edit'),                  (req, res) => res.render('stores/nsns/edit'));
    
    app.get('/stores/get/nsns',                permissions, allowed('access_nsns', {send: true}), (req, res) => {
        m.nsns.findAll({
            where: req.query,
            include: [
                inc.nsn_groups(),
                inc.nsn_classifications(),
                inc.nsn_countries(),
                inc.sizes({attributes: ['nsn_id']})
            ]
        })
        .then(nsns => res.send({result: true, nsns: nsns}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/nsn',                 permissions, allowed('access_nsns', {send: true}), (req, res) => {
        m.nsns.findOne({
            where: req.query,
            include: [
                inc.nsn_groups(),
                inc.nsn_classifications(),
                inc.nsn_countries(),
                inc.sizes({attributes: ['nsn_id']})
            ]
        })
        .then(nsn => {
            if (nsn) res.send({result: true, nsn: nsn})
            else     res.send({result: false, message: 'NSN not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/nsn_groups',          permissions, allowed('access_nsns', {send: true}), (req, res) => {
        m.nsn_groups.findAll({
            where: req.query
        })
        .then(nsn_groups => res.send({result: true, nsn_groups: nsn_groups}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/nsn_classifications', permissions, allowed('access_nsns', {send: true}), (req, res) => {
        m.nsn_classifications.findAll({
            where: req.query
        })
        .then(nsn_classifications => res.send({result: true, nsn_classifications: nsn_classifications}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/nsn_countries',       permissions, allowed('access_nsns', {send: true}), (req, res) => {
        m.nsn_countries.findAll({
            where: req.query
        })
        .then(nsn_countries => res.send({result: true, nsn_countries: nsn_countries}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/nsns',                   permissions, allowed('nsn_add',     {send: true}), (req, res) => {
        m.nsns.findOrCreate({
            where: {
                nsn_group_id: req.body.nsn.nsn_group_id,
                nsn_classification_id: req.body.nsn.nsn_classification_id,
                nsn_country_id: req.body.nsn.nsn_country_id,
                _item_number: req.body.nsn._item_number
            },
            defaults: {size_id: req.body.nsn.size_id}
        })
        .then(([nsn, created]) => {
            if (!created) res.send({result: false, message: 'NSN already exists'})
            else          res.send({result: true,  message: 'NSN added'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/nsns/:id',                permissions, allowed('nsn_edit',    {send: true}), (req, res) => {
        m.nsns.findOne({where: {nsn_id: req.params.id}})
        .then(nsn => {
            if (!nsn) res.send({result: false, message: 'NSN not found'})
            else {
                nsn.update(req.body.nsn)
                .then(result => res.send({result: true, message: 'NSN saved'}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.delete('/stores/nsns/:id',             permissions, allowed('nsn_delete',  {send: true}), (req, res) => {
        m.nsns.findOne({
            where: {nsn_id: req.params.id},
            attributes: ['nsn_id']
        })
        .then(nsn => {
            if (!nsn) res.send({result: false, message: 'NSN not found'})
            else {
                return nsn.destroy()
                .then(result => {
                    m.sizes.update(
                        {nsn_id: null},
                        {where: {nsn_id: req.params.id}}
                    )
                    .then(result => res.send({result: true, message: 'NSN deleted'}))
                    .catch(err => res.error.send(err, res));
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};