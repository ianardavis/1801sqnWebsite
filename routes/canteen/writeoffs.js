const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/writeoffs',             permissions, allowed('access_writeoffs'),                    (req, res) => res.render('canteen/writeoffs/index'));
    app.get('/canteen/writeoffs/:id',         permissions, allowed('access_writeoffs'),                    (req, res) => res.render('canteen/writeoffs/show'));
    
    app.get('/canteen/get/writeoffs',         permissions, allowed('access_writeoffs',      {send: true}), (req, res) => {
        m.writeoffs.findAll({
            include: [inc.users()],
            where: req.query
        })
        .then(writeoffs => res.send({result: true, writeoffs: writeoffs}))
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/writeoff',          permissions, allowed('access_writeoffs',      {send: true}), (req, res) => {
        m.writeoffs.findOne({
            where: req.query,
            include: [inc.users()]
        })
        .then(writeoff => {
            if (writeoff) res.send({result: true,  writeoff: writeoff})
            else         res.send({result: false, message: 'Writeoff not found'});
        })
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/writeoff_lines',    permissions, allowed('access_writeoff_lines', {send: true}), (req, res) => {
        m.writeoff_lines.findAll({
            include: [
                inc.items(),
                inc.users()
            ],
            where: req.query
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res))
    });

    app.post('/canteen/writeoffs',            permissions, allowed('writeoff_add',          {send: true}), (req, res) => {
        m.writeoffs.findOrCreate({
            where: {
                _status: 1,
                _reason: req.body.writeoff._reason
            },
            defaults: {user_id: req.user.user_id}
        })
        .then(([writeoff, created]) => {
            if (created) res.send({result: true,  message: 'Writeoff created'})
            else         res.send({result: false, message: 'Writeoff already open'});
        })
    
    });
    app.post('/canteen/writeoff_lines/:id',   permissions, allowed('writeoff_line_add',     {send: true}), (req, res) => {
        m.writeoffs.findOne({
            where: {writeoff_id: req.params.id},
            attributes: ['writeoff_id']
        })
        .then(writeoff => {
            if (writeoff) {
                return m.writeoff_lines.findOrCreate({
                    where: {
                        writeoff_id: writeoff.writeoff_id,
                        item_id:    req.body.line.item_id
                    },
                    defaults: {
                        _qty:    req.body.line._qty,
                        _cost:   req.body.line._cost,
                        user_id: req.user.user_id
                    }
                })
                .then(([line, created]) => {
                    if (created) res.send({result: true, message: 'Line added'})
                    else {
                        let actions = [line.increment('_qty', {by: req.body.line._qty})];
                        if (line._cost !== req.body.line._cost) {
                            actions.push(
                                line.update({
                                    _cost: ((line._qty * line._cost) + (Number(req.body.line._qty) * Number(req.body.line._cost))) / (line._qty + Number(req.body.line._qty))
                                })
                            );
                        };
                        return Promise.all(actions)
                        .then(result => res.send({result: true, message: 'Line updated'}))
                        .catch(err => res.error.send(err, res));
                    };
                })
                .catch(err => res.error.send(err, res));
            } else res.send({result: false, message: 'Writeoff not found'});
        })
        .catch(err => res.error.send(err, res));
    
    });

    app.put('/canteen/writeoffs/:id',         permissions, allowed('writeoff_edit',         {send: true}), (req, res) => {
        m.writeoffs.findOne({
            where: {writeoff_id: req.params.id},
            attributes: ['writeoff_id', '_status'],
            include: [inc.writeoff_lines({as: 'lines'})]
        })
        .then(writeoff => {
            if      (!writeoff)              res.send({result: false, message: 'Writeoff not found'})
            else if (writeoff._status !== 1) res.send({result: false, message: 'Writeoff is not open'})
            else {
                let actions = [];
                actions.push(
                    new Promise((resolve, reject) => {
                        let complete_actions = [];
                        writeoff.lines.forEach(line => {
                            complete_actions.push(
                                new Promise((resolve, reject) => {
                                    m.items.findOne({
                                        where: {item_id: line.item_id},
                                        attributes: ['item_id', '_qty', '_cost']
                                    })
                                    .then(item => {
                                        return item.decrement(
                                            '_qty',
                                            {by: line._qty}
                                        )
                                        .then(result => {
                                            line.update({_status: 2})
                                            .then(result => resolve(true))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err))
                                })
                            );
                        });
                        Promise.all(complete_actions)
                        .then(result => resolve('Lines completed'))
                        .catch(err => reject(err));
                    })
                );
                actions.push(writeoff.update({_status: 2}));
                actions.push(
                    m.notes.create({
                        _id: writeoff.writeoff_id,
                        _table: 'writeoffs',
                        _note: 'Completed',
                        user_id: req.user.user_id,
                        _system: 1
                    })
                );
                return Promise.all(actions)
                .then(result => res.send({result: true, message: `Writeoff completed`}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.send(err, res));
    });
    
    app.delete('/canteen/writeoff_lines/:id', permissions, allowed('writeoff_line_delete',  {send: true}), (req, res) => {
        m.writeoff_lines.update({_status: 0}, {where: {line_id: req.params.id}})
        .then(result => res.send({result: true, message: 'Line deleted'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/canteen/writeoffs/:id',      permissions, allowed('writeoff_delete',       {send: true}), (req, res) => {
        m.writeoffs.findOne({
            where: {writeoff_id: req.params.id},
            attributes: ['writeoff_id', '_status']
        })
        .then(writeoff => {
            if      (!writeoff)              res.send({result: false, message: 'Writeoff not found'})
            else if (writeoff._status !== 1) res.send({result: false, message: 'Writeoff is not open'})
            else {
                let actions = [];
                actions.push(writeoff.update({_status: 0}));
                actions.push(m.writeoff_lines.update({_status: 0}, {where: {writeoff_id: writeoff.writeoff_id}}));
                actions.push(
                    m.notes.create({
                        _id: writeoff.writeoff_id,
                        _table: 'writeoffs',
                        _note: 'Cancelled',
                        user_id: req.user.user_id,
                        _system: 1
                    })
                );
                return Promise.all(actions)
                .then(result => res.send({result: true, message: 'Writeoff cancelled'}))
                .catch(err => res.error.send(err, res));
            }
        })
        .catch(err => res.error.send(err, res));
    });
};