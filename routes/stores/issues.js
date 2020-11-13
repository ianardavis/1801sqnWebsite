module.exports = (app, allowed, inc, loggedIn, m) => {
    let loancard = require(process.env.ROOT + '/fn/stores/loancard'),
        issues   = require(process.env.ROOT + '/fn/stores/issues'),
        utils    = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/issues',              loggedIn, allowed('access_issues'),                                (req, res) => res.render('stores/issues/index'));
    app.get('/stores/issues/:id',          loggedIn, allowed('access_issues',                 {allow: true}), (req, res) => {
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
    app.get('/stores/issue_lines/:id',     loggedIn, allowed('access_issues',                 {allow: true}), (req, res) => {
        m.issue_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['issue_id']
        })
        .then(line => res.redirect(`/stores/issues/${line.issue_id}`))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/issues/:id/download', loggedIn, allowed('access_issues'),                                (req, res) => {
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
    
    app.put('/stores/issues/:id',          loggedIn, allowed('issue_edit',        {send: true}),              (req, res) => {
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

    app.post('/stores/issues',             loggedIn, allowed('issue_add',         {send: true}),              (req, res) => {
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
    app.post('/stores/issue_lines/:id',    loggedIn, allowed('issue_line_add',    {send: true}),              (req, res) => {
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
    app.delete('/stores/issues/:id',       loggedIn, allowed('issue_delete',      {send: true}),              (req, res) => {
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
    app.delete('/stores/issue_lines/:id',  loggedIn, allowed('issue_line_delete', {send: true}),              (req, res) => { //
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
};