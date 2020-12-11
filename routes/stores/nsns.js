module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/stores/nsns/new',       permissions, allowed('nsn_add'),                   (req, res) => {
        m.sizes.findOne({
            where: {size_id: req.query.size_id},
            include: [inc.items()]
        })
        .then(size => res.render('stores/nsns/new', {size: size}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/nsns/:id',       permissions, allowed('nsn_edit'),                  (req, res) => res.render('stores/nsns/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/nsns/:id/edit',  permissions, allowed('nsn_edit'),                  (req, res) => res.render('stores/nsns/edit'));
    
    app.get('/stores/get/nsns',       permissions, allowed('access_nsns', {send: true}), (req, res) => {
        m.nsns.findAll({
            where:   req.query,
            include: [
                inc.nsn_groups(),
                inc.nsn_classifications(),
                inc.nsn_countries()
            ]
        })
        .then(nsns => res.send({result: true, nsns: nsns}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/nsn_groups', permissions, allowed('access_nsns', {send: true}), (req, res) => {
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
    app.get('/stores/get/nsn_countries', permissions, allowed('access_nsns', {send: true}), (req, res) => {
        m.nsn_countries.findAll({
            where: req.query
        })
        .then(nsn_countries => res.send({result: true, nsn_countries: nsn_countries}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/nsns',          permissions, allowed('nsn_add',     {send: true}), (req, res) => {
        m.nsns.create(req.body.nsn)
        .then(nsn => res.send({result: true, message: 'NSN added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/nsns/:id',       permissions, allowed('nsn_edit',    {send: true}), (req, res) => {
        m.nsns.update(
            req.body.nsn,
            {where: {nsn_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'NSN saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/nsns/:id',    permissions, allowed('nsn_delete',  {send: true}), (req, res) => {
        m.nsns.destroy({where: {nsn_id: req.params.id}})
        .then(result => {
            m.sizes.update(
                {nsn_id: null},
                {where: {nsn_id: req.params.id}}
            )
            .then(result => res.send({result: true, message: 'NSN deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    };
