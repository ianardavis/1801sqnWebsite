module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/nsns/new',      isLoggedIn, allowed('nsn_add'),                (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.query.size_id},
            include: [inc.items()]
        })
        .then(size => res.render('stores/nsns/new', {size: size}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/nsns/:id',      isLoggedIn, allowed('nsn_edit'),               (req, res) => res.render('stores/nsns/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/nsns/:id/edit', isLoggedIn, allowed('nsn_edit'),               (req, res) => res.render('stores/nsns/edit'));
    
    app.post('/stores/nsns',         isLoggedIn, allowed('nsn_add',  {send: true}), (req, res) => {
        m.nsns.create(req.body.nsn)
        .then(nsn => {
            if (req.body.default) {
                db.update({
                    table: m.sizes,
                    where: {size_id: nsn.size_id},
                    record: {nsn_id: nsn.nsn_id}
                })
                .then(result => res.send({result: true, message: 'NSN added as default'}))
                .catch(err => res.error.send(err, res));
            } else res.send({result: true, message: 'NSN added'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/nsns/:id',      isLoggedIn, allowed('nsn_edit', {send: true}), (req, res) => {
        m.sizes.findOne({
            attributes: ['nsn_id'],
            where: {size_id: req.body.size_id}
        })
        .then(currentDefault => {
            let actions = [];
            actions.push(
                db.update({
                    table: m.nsns,
                    where: {nsn_id: req.params.id},
                    record: req.body.nsn
                })
            );
            if (req.body.default && Number(currentDefault.nsn_id) !== Number(req.params.id)) {
                actions.push(
                    db.update({
                        table: m.sizes,
                        where: {size_id: req.body.size_id},
                        record: {nsn_id: req.params.id}
                    })
                );
            } else if (Number(currentDefault.nsn_id) === Number(req.params.id)) {
                actions.push(
                    db.update({
                        table: m.sizes,
                        where: {size_id: req.body.size_id},
                        record: {nsn_id: null}
                    })
                );
            };
            Promise.allSettled(actions)
            .then(result => res.send({result: true, message: 'NSN saved'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
};
