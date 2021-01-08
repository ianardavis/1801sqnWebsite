module.exports = (app, allowed, inc, permissions, m) => {
    let loancard = {}, issues = {},
        addYears       = require(`../functions/add_years`),
        promiseResults = require(`../functions/promise_results`);
        require(`./functions/loancard`)(m, loancard);
        require(`./functions/issues`)  (m, issues);
    app.get('/stores/issues',                 permissions, allowed('access_issues'),                                (req, res) => res.render('stores/issues/index'));
    app.get('/stores/issues/:id',             permissions, allowed('access_issues',                 {allow: true}), (req, res) => {
        m.stores.issues.findOne({
            where: {issue_id: req.params.id},
            attributes: ['user_id_issue']
        })
        .then(issue => {
            if (req.allowed || issue.user_id_issue === req.user.user_id) {
                res.render('stores/issues/show', {
                    download: req.query.download || null
                })
            } else res.error.redirect(new Error('Permission denied'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/issue_lines/:id',        permissions, allowed('access_issues',                 {allow: true}), (req, res) => {
        m.stores.issue_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['issue_id']
        })
        .then(line => res.redirect(`/stores/issues/${line.issue_id}`))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/issues/:id/download',    permissions, allowed('access_issues'),                                (req, res) => {
        m.stores.issues.findOne({
            where: {issue_id: req.params.id},
            attributes: ['issue_id', '_filename']
        })
        .then(issue => {
            if (issue._filename && issue._filename !== '') {
                res.redirect(`/stores/issues/${issue.issue_id}?download=${issue._filename}`);
            } else {
                loancard.create({issue_id: issue.issue_id})
                .then(filename => res.redirect(`/stores/issues/${issue.issue_id}?download=${filename}`))
                .catch(err => res.error.redirect(err, req, res));
            }
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/issue',              permissions, allowed('access_issues',      {send: true}),             (req, res) => {
        m.stores.issues.findOne({
            where:      req.query,
            include:    [
                inc.users({as: 'user_issue'}), 
                inc.users({as: 'user'}),
                inc.issue_lines()
            ]
        })
        .then(issue => {
            if (issue) res.send({success: true, issue: issue})
            else       res.send({success: false, message: 'Issue not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issues',             permissions, allowed('access_issues',      {send: true}),             (req, res) => {
        m.stores.issues.findAll({
            where:      req.query,
            include:    [
                inc.users({as: 'user_issue'}), 
                inc.users({as: 'user'}),
                inc.issue_lines()
            ]
        })
        .then(issues => res.send({success: true, issues: issues}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_lines',        permissions, allowed('access_issue_lines', {send: true}),             (req, res) => {
        m.stores.issue_lines.findAll({
            where:      req.query,
            include:    [
                inc.users(),
                inc.sizes({stock: true}),
                inc.stock({as: 'stock'}),
                inc.issues()
            ]
        })
        .then(lines => res.send({success: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_line',         permissions, allowed('access_issue_lines', {send: true}),             (req, res) => {
        m.stores.issue_lines.findOne({
            where:   req.query,
            include: [
                inc.users(),
                inc.sizes({stock: true}),
                inc.stock({as: 'stock'}),
                inc.issues()
            ]
        })
        .then(line => {
            if (line) res.send({success: true,  issue_line: line})
            else      res.send({success: false, message: 'Line not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_lines/:id',    permissions, allowed('access_issue_lines', {send: true}),             (req, res) => {
        let include = [
            inc.users(),
            inc.sizes({stock: true}),
            inc.stock({as: 'stock'}),
            inc.issues({
                where: {user_id_issue: req.params.id},
                required: true
            })
        ];
        if (req.query.returned) {
            if (req.query.returned === '0') {
                
            } else if (req.query.returned === '1') {
                include.push(inc.issue_line_returns({required: true}))
            };
        };
        m.stores.issue_lines.findAll({include: include})
        .then(issue_lines => res.send({success: true, issue_lines: issue_lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_line_returns', permissions, allowed('access_issue_lines', {send: true}),             (req, res) => {
        m.stores.issue_line_returns.findAll({
            where:   req.query,
            include: [
                inc.issue_lines({as: 'issue_line'}),
                inc.stock({as: 'stock'}),
                inc.locations({as: 'location'}),
                inc.users()
            ]
        })
        .then(lines => res.send({success: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_line_actions', permissions, allowed('access_issue_lines', {send: true}),             (req, res) => {
        m.stores.issue_line_actions.findAll({
            where:   req.query,
            include: [
                inc.issue_lines({as: 'issue_line'}),
                inc.users()
            ]
        })
        .then(lines => res.send({success: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/issues/:id',             permissions, allowed('issue_edit',         {send: true}),             (req, res) => {
        if (req.body.issue) {
            m.stores.issues.findOne({
                where: {issue_id: req.params.id},
                include: [inc.issue_lines()],
                attributes: ['issue_id']
            })
            .then(issue => {
                if (issue.lines.length > 0) {
                    m.stores.issues.update(
                        req.body.issue,
                        {where: {issue_id: issue.issue_id}}
                    )
                    .then(result => res.send({success: true, message: 'Issue updated'}))
                    .catch(err => res.error.send(err, res));
                } else res.error.send('An issue must have at least 1 line to be completed', res);
            })
            .catch(err => res.error.send(err, res));
        } else res.error.send('No issue details', res);
    });

    app.post('/stores/issues',                permissions, allowed('issue_add',          {send: true}),             (req, res) => {
        issues.create({
            issue: {
                user_id_issue: req.body.user_id_issue,
                user_id:   req.user.user_id,
                _date_due: addYears(7)
            }
        })
        .then(result => {
            let message = 'Issue raised: ';
            if (!result.created) message = 'There is already an issue open for this user: ';
            res.send({success: true, message: message + result.issue.issue_id})
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/issue_lines/:id',       permissions, allowed('issue_line_add',     {send: true}),             (req, res) => {
        req.body.line.user_id  = req.user.user_id;
        req.body.line.issue_id = req.params.id;
        issues.createLine({line: req.body.line})
        .then(line_id => res.send({success: true, message: `Line added: ${line_id}`}))
        .catch(err => res.error.send(err, res))
    });
    app.post('/stores/issue_line_returns',    permissions, allowed('return_line_add',    {send: true}),             (req, res) => {
        let actions = [];
        for (let [lineID, line] of Object.entries(req.body.return)) {
            if (line.stock_id !== '') {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                actions.push(return_issue_line(line, req.user.user_id));
            };
        };
        Promise.allSettled(actions)
        .then(results => {
            if (promiseResults(results)) res.send({success: true, message: 'Lines returned'})
            else res.error.send('Some lines failed', res);
        })
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/issues/:id',          permissions, allowed('issue_delete',       {send: true}),             (req, res) => {
        m.stores.issues.findOne({
            where: {issue_id: req.params.id},
            include: [inc.issue_lines()]
        })
        .then(issue => {
            if (issue._complete || issue._closed) res.error.send('Completed/closed issues can not be deleted');
            else {
                if (issue.lines.filter(e => e.return_line_id).length === 0) {
                    m.stores.issue_lines.destroy({where: {issue_id: req.params.id}})
                    .then(result => {
                        issue.destroy()
                        .then(result => res.send({success: true, message: 'Issue deleted'}))
                        .catch(err => res.error.send(err, res));
                    })
                    .catch(err => res.error.send(err, res));
                } else res.error.send('Returned issue lines can not be deleted');
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/issue_lines/:id',     permissions, allowed('issue_line_delete',  {send: true}),             (req, res) => { 
        m.stores.issue_lines.findOne({where: {line_id: req.params.id}})
        .then(line => {
            if (line.return_line_id) res.error.send('Returned issue lines can not be deleted')
            else {
                line.destroy()
                .then(result => res.send({success: true, message: 'Line deleted'}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });

    return_issue_line = (line, user_id) => new Promise((resolve, reject) => {
        m.stores.issue_lines.findOne({
            where: {line_id: line.line_id},
            include: [inc.issues()]
        })
        .then(issue_line => {
            if (Number(line._qty) > Number(issue_line._qty)) {
                reject(new Error('Returned quantity greater than issued quantity'));
            } else {
                returns.create({
                    return: {
                        from: issue_line.issue.user_id_issue,
                        user_id: user_id
                    }
                })
                .then(_return => {
                    returns.createLine({
                        line: {
                            return_id: _return.return_id,
                            size_id: issue_line.size_id,
                            stock_id: line.stock_id,
                            issue_line_id: issue_line.line_id,
                            _qty: line._qty,
                            user_id: user_id,
                            serial_id: issue_line.serial_id
                        }
                    })
                    .then(return_line_id => {
                        if (Number(line._qty) === Number(issue_line._qty)) {
                            m.stores.issue_lines.update(
                                {return_line_id: return_line_id},
                                {where: {line_id: issue_line.line_id}}
                            )
                            .then(result => resolve(true))
                            .catch(err => reject(err));
                        } else {
                            let actions = [];
                            actions.push(
                                stock.decrement({
                                    table: m.stores.issue_lines,
                                    id: issue_line.line_id,
                                    by: line._qty
                                })
                            );
                            actions.push(
                                m.stores.notes.create({
                                    _table: 'issues',
                                    _id: issue_line.issue_id,
                                    _note: 'Line partially returned: ' + issue_line._line,
                                    user_id: user_id,
                                    system: 1
                                })
                            )
                            let new_issue_line = {
                                issue_id:       issue_line.issue_id,
                                size_id:        issue_line.size_id,
                                stock_id:       issue_line.stock_id,
                                _line:          issue_line._line,
                                nsn_id:         issue_line.nsn_id,
                                _qty:           line._qty,
                                serial_id:      issue_line.serial_id,
                                return_line_id: return_line_id,
                                user_id:        user_id
                            };
                            actions.push(m.stores.issue_lines.create(new_issue_line));
                            Promise.allSettled(actions)
                            .then(results => {
                                if (promiseResults(results)) resolve(return_line_id)
                                else reject(new Error('Some actions failed'));
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err))
            };
        })
        .catch(err => reject(err))
    });
};