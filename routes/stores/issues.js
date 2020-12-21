module.exports = (app, allowed, inc, permissions, m) => {
    let loancard = require(process.env.ROOT + '/fn/stores/loancard'),
        issues   = require(process.env.ROOT + '/fn/stores/issues'),
        utils    = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/issues',                 permissions, allowed('access_issues'),                                (req, res) => res.render('stores/issues/index'));
    app.get('/stores/issues/:id',             permissions, allowed('access_issues',                        {allow: true}), (req, res) => {
        m.issues.findOne({
            where: {issue_id: req.params.id},
            attributes: ['issued_to']
        })
        .then(issue => {
            if (req.allowed || issue.issued_to === req.user.user_id) {
                res.render('stores/issues/show', {
                    download: req.query.download || null,
                    tab: req.query.tab || 'details'
                })
            } else res.error.redirect(new Error('Permission denied'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/issue_lines/:id',        permissions, allowed('access_issues',                        {allow: true}), (req, res) => {
        m.issue_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['issue_id']
        })
        .then(line => res.redirect(`/stores/issues/${line.issue_id}`))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/issues/:id/download',    permissions, allowed('access_issues'),                                       (req, res) => {
        m.issues.findOne({
            where: {issue_id: req.params.id},
            attributes: ['issue_id', '_filename']
        })
        .then(issue => {
            if (issue._filename && issue._filename !== '') {
                res.redirect(`/stores/issues/${issue.issue_id}?download=${issue._filename}`);
            } else {
                loancard.create({
                    m: {issues: m.issues},
                    issue_id: issue.issue_id
                })
                .then(filename => res.redirect(`/stores/issues/${issue.issue_id}?download=${filename}`))
                .catch(err => res.error.redirect(err, req, res));
            }
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/issue',              permissions, allowed('access_issues',             {send: true}),             (req, res) => {
        m.issues.findOne({
            where:      req.query,
            include:    [
                inc.users({as: 'user_to'}), 
                inc.users({as: 'user_by'}),
                inc.issue_lines()
            ]
        })
        .then(issue => {
            if (issue) res.send({result: true, issue: issue})
            else       res.send({result: false, message: 'Issue not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issues',             permissions, allowed('access_issues',             {send: true}),             (req, res) => {
        m.issues.findAll({
            where:      req.query,
            include:    [
                inc.users({as: 'user_to'}), 
                inc.users({as: 'user_by'}),
                inc.issue_lines()
            ]
        })
        .then(issues => res.send({result: true, issues: issues}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_lines',        permissions, allowed('access_issue_lines',        {send: true}),             (req, res) => {
        m.issue_lines.findAll({
            where:      req.query,
            include:    [
                inc.users(),
                inc.sizes({stock: true}),
                inc.stock({as: 'stock'}),
                inc.issues()
            ]
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_lines/:id',    permissions, allowed('access_issue_lines',        {send: true}),             (req, res) => {
        m.issue_lines.findAll({
            include: [
                inc.users(),
                inc.sizes({stock: true}),
                inc.stock({as: 'stock'}),
                inc.issues({
                    where: {issued_to: req.params.id},
                    required: true
                })
            ]
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_line_returns', permissions, allowed('access_issue_line_returns', {send: true}),             (req, res) => {
        m.issue_line_returns.findAll({
            where:   req.query,
            include: [
                inc.issue_lines({as: 'issue_line'}),
                inc.stock({as: 'stock'}),
                inc.locations({as: 'location'}),
                inc.users()
            ]
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/issues/:id',             permissions, allowed('issue_edit',                {send: true}),             (req, res) => {
        if (req.body.issue) {
            m.issues.findOne({
                where: {issue_id: req.params.id},
                include: [inc.issue_lines()],
                attributes: ['issue_id']
            })
            .then(issue => {
                if (issue.lines.length > 0) {
                    m.issues.update(
                        req.body.issue,
                        {where: {issue_id: issue.issue_id}}
                    )
                    .then(result => res.send({result: true, message: 'Issue updated'}))
                    .catch(err => res.error.send(err, res));
                } else res.error.send('An issue must have at least 1 line to be completed', res);
            })
            .catch(err => res.error.send(err, res));
        } else res.error.send('No issue details', res);
    });

    app.post('/stores/issues',                permissions, allowed('issue_add',                 {send: true}),             (req, res) => {
        issues.create({
            m: {issues: m.issues},
            issue: {
                issued_to: req.body.issued_to,
                user_id:   req.user.user_id,
                _date_due: utils.addYears(7)
            }
        })
        .then(result => {
            let message = 'Issue raised: ';
            if (!result.created) message = 'There is already an issue open for this user: ';
            res.send({result: true, message: message + result.issue.issue_id})
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/issue_lines/:id',       permissions, allowed('issue_line_add',            {send: true}),             (req, res) => {
        req.body.line.user_id  = req.user.user_id;
        req.body.line.issue_id = req.params.id;
        issues.createLine({
            m: {
                issue_lines: m.issue_lines,
                serials:     m.serials,
                issues:      m.issues,
                sizes:       m.sizes,
                stock:       m.stock
            },
            line: req.body.line
        })
        .then(line_id => res.send({result: true, message: `Line added: ${line_id}`}))
        .catch(err => res.error.send(err, res))
    });
    app.post('/stores/issue_line_returns',    permissions, allowed('return_line_add',           {send: true}),             (req, res) => {
        let actions = [];
        for (let [lineID, line] of Object.entries(req.body.return)) {
            if (line.stock_id !== '') {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                actions.push(return_issue_line(line, req.user.user_id));
            };
        };
        Promise.allSettled(actions)
        .then(results => {
            if (utils.promiseResults(results)) res.send({result: true, message: 'Lines returned'})
            else res.error.send('Some lines failed', res);
        })
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/issues/:id',          permissions, allowed('issue_delete',              {send: true}),             (req, res) => {
        m.issues.findOne({
            where: {issue_id: req.params.id},
            include: [inc.issue_lines()]
        })
        .then(issue => {
            if (issue._complete || issue._closed) res.error.send('Completed/closed issues can not be deleted');
            else {
                if (issue.lines.filter(e => e.return_line_id).length === 0) {
                    m.issue_lines.destroy({where: {issue_id: req.params.id}})
                    .then(result => {
                        issue.destroy()
                        .then(result => res.send({result: true, message: 'Issue deleted'}))
                        .catch(err => res.error.send(err, res));
                    })
                    .catch(err => res.error.send(err, res));
                } else res.error.send('Returned issue lines can not be deleted');
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/issue_lines/:id',     permissions, allowed('issue_line_delete',         {send: true}),             (req, res) => { 
        m.issue_lines.findOne({where: {line_id: req.params.id}})
        .then(line => {
            if (line.return_line_id) res.error.send('Returned issue lines can not be deleted')
            else {
                line.destroy()
                .then(result => res.send({result: true, message: 'Line deleted'}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });

    return_issue_line = (line, user_id) => new Promise((resolve, reject) => {
        m.issue_lines.findOne({
            where: {line_id: line.line_id},
            include: [inc.issues()]
        })
        .then(issue_line => {
            if (Number(line._qty) > Number(issue_line._qty)) {
                reject(new Error('Returned quantity greater than issued quantity'));
            } else {
                returns.create({
                    m: {returns: m.returns},
                    return: {
                        from: issue_line.issue.issued_to,
                        user_id: user_id
                    }
                })
                .then(_return => {
                    returns.createLine({
                        m: {
                            returns: m.returns,
                            return_lines: m.return_lines,
                            stock: m.stock,
                            serials: m.serials
                        },
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
                            m.issue_lines.update(
                                {return_line_id: return_line_id},
                                {where: {line_id: issue_line.line_id}}
                            )
                            .then(result => resolve(true))
                            .catch(err => reject(err));
                        } else {
                            let actions = [];
                            actions.push(
                                stock.decrement({
                                    table: m.issue_lines,
                                    id: issue_line.line_id,
                                    by: line._qty
                                })
                            );
                            actions.push(
                                m.notes.create({
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
                            actions.push(m.issue_lines.create(new_issue_line));
                            Promise.allSettled(actions)
                            .then(results => {
                                if (utils.promiseResults(results)) resolve(return_line_id)
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