module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/nsns/new',            isLoggedIn, allowed('nsn_add'),                   (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.query.size_id},
            include: [m.items]
        })
        .then(itemsize => res.render('stores/nsns/new', {itemsize: itemsize}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/nsns/:id',            isLoggedIn, allowed('nsn_edit'),                  (req, res) => {
        db.findOne({
            table: m.nsns,
            where: {nsn_id: req.params.id},
            include: [inc.sizes()]
        })
        .then(nsn => {
            res.render('stores/nsns/show', {
                nsn:   nsn,
                notes: {table: 'nsns', id: nsn.nsn_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/nsns/:id/edit',       isLoggedIn, allowed('nsn_edit'),                  (req, res) => {
        db.findOne({
            table: m.nsns,
            where: {nsn_id: req.params.id},
            include: [inc.sizes()]
        })
        .then(nsn => res.render('stores/nsns/edit', {nsn: nsn}))
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/nsns',            isLoggedIn, allowed('access_nsns', {send: true}), (req, res) => {
        m.nsns.findAll({where: req.query})
        .then(nsns => res.send({result: true, nsns: nsns}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/nsns/bysize/:id', isLoggedIn, allowed('access_nsns', {send: true}), (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.params.id},
            include: [inc.nsns()]
        })
        .then(size => res.send({result: true, nsns: size.nsns, required: size._nsns}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/nsns',               isLoggedIn, allowed('nsn_add',     {send: true}), (req, res) => {
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
    app.put('/stores/nsns/:id',            isLoggedIn, allowed('nsn_edit',    {send: true}), (req, res) => {
        let actions = [];
        actions.push(
            db.update({
                table: m.nsns,
                where: {nsn_id: req.params.id},
                record: req.body.nsn
            })
        );
        if (req.body.default && Number(req.body.currentDefault) !== Number(req.params.id)) {
            actions.push(
                db.update({
                    table: m.sizes,
                    where: {size_id: req.body.size_id},
                    record: {nsn_id: req.params.id}
                })
            );
        } else if (Number(req.body.currentDefault) === Number(req.params.id)) {
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
    });
    app.delete('/stores/nsns/:id',         isLoggedIn, allowed('nsn_delete',  {send: true}), (req, res) => {
        db.destroy({
            table: m.nsns,
            where: {nsn_id: req.params.id}
        })
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
