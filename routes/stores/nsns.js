module.exports = (app, allowed, inc, loggedIn, m) => {
    app.get('/stores/nsns/new',      loggedIn, allowed('nsn_add'),                   (req, res) => {
        m.sizes.findOne({
            where: {size_id: req.query.size_id},
            include: [inc.items()]
        })
        .then(size => res.render('stores/nsns/new', {size: size}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/nsns/:id',      loggedIn, allowed('nsn_edit'),                  (req, res) => res.render('stores/nsns/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/nsns/:id/edit', loggedIn, allowed('nsn_edit'),                  (req, res) => res.render('stores/nsns/edit'));
    
    app.get('/stores/get/nsns',      loggedIn, allowed('access_nsns', {send: true}), (req, res) => {
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

    app.post('/stores/nsns',         loggedIn, allowed('nsn_add',     {send: true}), (req, res) => {
        m.nsns.create(req.body.nsn)
        .then(nsn => res.send({result: true, message: 'NSN added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/nsns/:id',      loggedIn, allowed('nsn_edit',    {send: true}), (req, res) => {
        m.nsns.update(
            req.body.nsn,
            {where: {nsn_id: req.params.id}}
        )
        .then(result => res.send({result: true, message: 'NSN saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/nsns/:id',   loggedIn, allowed('nsn_delete',  {send: true}), (req, res) => {
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
