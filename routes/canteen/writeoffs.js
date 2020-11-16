const op = require('sequelize').Op;
module.exports = (app, allowed, inc, loggedIn, m) => {
    let canteen  = require(process.env.ROOT + '/fn/canteen'),
        settings = require(process.env.ROOT + '/fn/settings');
    app.get('/canteen/writeoffs',              loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoffs.findAll({
            include: [
                inc.canteen_writeoff_lines(),
                inc.users()
            ]
        })
        .then(writeoffs => res.render('canteen/writeoffs/index', {writeoffs: writeoffs}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/writeoffs/:id/complete', loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoff_lines.findAll({
            where: {writeoff_id: req.params.id},
            include: [
                inc.canteen_items(),
                inc.canteen_writeoffs({as: 'writeoff'})
            ]
        })
        .then(lines => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    canteen.completeMovement({
                        m: {
                            canteen_items: m.canteen_items,
                            update: m.canteen_writeoff_lines
                        },
                        action: 'decrement',
                        line: line
                    })
                );
            });
            actions.push(
                m.canteen_writeoffs.update(
                    {_complete: 1},
                    {where: {writeoff_id: req.params.id}}
                )
            )
            Promise.allSettled(actions)
            .then(results => {
                req.flash('success', 'Writeoff completed');
                res.redirect('/canteen/writeoffs/' + req.params.id);
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/writeoffs/new/:reason',  loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoffs.findOne({
            where: {
                _complete: 0,
                user_id: req.user.user_id
            }
        })
        .then(writeoff => {
            if (!writeoff) {
                m.canteen_writeoffs.create({
                    user_id: req.user.user_id,
                    _reason: req.params.reason || 'Unspecified'
                })
                .then(new_writeoff => {
                    req.flash('success', 'Writeoff created: ' + new_writeoff.writeoff_id);
                    res.redirect('/canteen/writeoffs');
                })
                .catch(err => res.error.redirect(err, req, res));
            } else {
                req.flash('success', 'Writeoff already open: ' + writeoff.writeoff_id);
                res.redirect('/canteen/writeoffs');
            };
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/writeoffs/:id',          loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoffs.findOne({
            where: {writeoff_id: req.params.id},
            include: [inc.canteen_writeoff_lines()]
        })
        .then(writeoff => res.render('canteen/writeoffs/show', {writeoff: writeoff}))
        .catch(err => res.error.redirect(err, req, res));
    });

    app.get('/canteen/get/writeoffs',          loggedIn, allowed('access_writeoffs',      {send: true}), (req, res) => {
        m.writeoffs.findAll({where: req.query})
        .then(writeoffs => res.send({result: true, writeoffs: writeoffs}))
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/writeoff_lines',     loggedIn, allowed('access_writeoff_lines', {send: true}), (req, res) => {
        m.writeoff_lines.findAll({where: req.query})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res))
    });

    app.post('/canteen/writeoff_lines',        loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoff_lines.findOne({
            where: {
                writeoff_id: req.body.line.writeoff_id,
                item_id: req.body.line.item_id
            }
        })
        .then(line => {
            if (!line) {
                m.canteen_writeoff_lines.create(req.body.line)
                .then(line => {
                    req.flash('success', 'Item added');
                    res.redirect('/canteen/items/' + req.body.line.item_id);
                })
                .catch(err => res.error.redirect(err, req, res));
            } else {
                req.flash('danger', 'Item already on writeoff');
                res.redirect('/canteen/items/' + req.body.line.item_id);
            };
        })
    });

    app.put('/canteen/writeoff_lines/:id',     loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoff_lines.update(
            req.body.line,
            {where: {line_id: req.params.id}}
        )
        .then(result => {
            req.flash('success', 'Line updated');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.put('/canteen/writeoffs/:id',          loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoffs.update(
            req.body.writeoff,
            {where: {writeoff_id: req.params.id}}
        )
        .then(result => {
            req.flash('success', 'Writeoff updated');
            res.redirect('/canteen/writeoffs/' + req.params.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.delete('/canteen/writeoff_lines/:id',  loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoff_lines.destroy({where: {line_id: req.params.id}})
        .then(result => {
            req.flash('success', 'Line removed');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.delete('/canteen/writeoffs/:id',       loggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_writeoffs.destroy({where: {writeoff_id: req.params.id}})
        .then(result => {
            req.flash('success', 'Writeoff deleted');
            res.redirect('/canteen');
        })
        .catch(err => res.error.redirect(err, req, res));
    });
};