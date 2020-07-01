module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        loancard = require(process.env.ROOT + '/fn/loancard'),
        issues   = require(process.env.ROOT + '/fn/issues'),
        utils    = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/issues',               isLoggedIn, allowed('access_issues'),                     (req, res) => res.render('stores/issues/index'));
    app.get('/stores/issues/:id',           isLoggedIn, allowed('access_issues',      {allow: true}), (req, res) => {
        db.findOne({
            table: m.issues,
            where: {issue_id: req.params.id},
            include: [
                inc.users({as: '_to'}),
                inc.users({as: '_by'})
        ]})
        .then(issue => {
            if (req.allowed || issue.issuedTo.user_id === req.user.user_id) {
                res.render('stores/issues/show', {
                    issue: issue,
                    download: req.query.download || null,
                    show_tab: req.query.tab || 'details'
                })
            } else res.error.redirect(new Error('Permission denied'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/issuelines/:id',      isLoggedIn, allowed('access_issues',      {allow: true}), (req, res) => {
        db.findOne({
            table: m.issue_lines,
            where: {line_id: req.params.id}
        })
        .then(line => res.redirect('/stores/issues/' + line.issue_id))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/issues/:id/download',  isLoggedIn, allowed('access_issues'),                     (req, res) => {
        db.findOne({
            table: m.issues,
            where: {issue_id: req.params.id}
        })
        .then(issue => {
            if (issue._filename && issue._filename !== '') {
                res.redirect('/stores/issues/' + req.params.id  + '?download=' + issue._filename);
            } else {
                loancard.create({
                    m: {issues: m.issues},
                    issue_id: req.params.id
                })
                .then(filename => res.redirect('/stores/issues/' + req.params.id  + '?download=' + filename))
                .catch(err => res.error.redirect(err, req, res));
            }
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/issues',           isLoggedIn, allowed('access_issues',      {send: true}), (req, res) => {
        m.issues.findAll({
            where: res.query,
            include: [
                inc.users({as: '_to'}), 
                inc.users({as: '_by'}),
                inc.issue_lines()
        ]})
        .then(issues => res.send({result: true, issues: issues}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issuelines/bysize', isLoggedIn, allowed('access_issue_lines', {send: true}), (req, res) => {
        m.issue_lines.findAll({
            where: req.query,
            include: [
                inc.issues(),
                inc.users(),
                inc.stock({as: 'stock'})
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issuelines/:id',   isLoggedIn, allowed('access_issue_lines', {send: true}), (req, res) => {
        m.issue_lines.findAll({
            include: [
                inc.users(),
                inc.sizes({stock: true}),
                inc.stock({as: 'stock'}),
                inc.issues({
                    where: {issued_to: req.params.id},
                    required: true
        })]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issuelines',       isLoggedIn, allowed('access_issue_lines', {send: true}), (req, res) => {
        m.issue_lines.findAll({
            where: req.query,
            include: [
                inc.nsns({as: 'nsn'}),
                inc.serials({as: 'serial'}),
                inc.users(),
                inc.stock({as: 'stock'}),
                inc.sizes({stock: true}),
                inc.return_lines({
                    as: 'return',
                    include: [
                        inc.stock({as: 'stock'}),
                        inc.returns()
        ]})]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    
    app.put('/stores/issues/:id',          isLoggedIn, allowed('issue_edit',         {send: true}), (req, res) => {
        if (req.body.issue) {
            db.findOne({
                table: m.issues,
                where: {issue_id: req.params.id},
                include: [inc.issue_lines()],
                attributes: ['issue_id']
            })
            .then(issue => {
                if (issue.lines.length > 0) {
                    db.update({
                        table: m.issues,
                        where: {issue_id: issue.issue_id},
                        record: req.body.issue
                    })
                    .then(result => res.send({result: true, message: 'Issue updated'}))
                    .catch(err => res.error.send(err, res));
                } else res.error.send('An issue must have at least 1 line to be completed', res);
            })
            .catch(err => res.error.send(err, res));
        } else res.error.send('No issue details', res);
    });

    app.post('/stores/issues',             isLoggedIn, allowed('issue_add',          {send: true}), (req, res) => {
        issues.create({
            m: {issues: m.issues},
            issue: {
                issued_to: req.body.issued_to,
                user_id:   req.user.user_id,
                _date_due: utils.addYears(7)
            }
        })
        .then(issue_id => {
            let message = 'Issue raised: ';
            if (!result.created) message = 'There is already an issue open for this user: ';
            res.send({result: true, message: message + issue_id})
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/issue_lines/:id',    isLoggedIn, allowed('issue_line_add',     {send: true}), (req, res) => {
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
        .then(line_id => res.send({result: true, message: 'Line added: ' + line_id}))
        .catch(err => res.error.send(err, res))
    });

    app.delete('/stores/issues/:id',       isLoggedIn, allowed('issue_delete',       {send: true}), (req, res) => {
        db.findOne({
            table: m.issues,
            where: {issue_id: req.params.id},
            include: [inc.issue_lines()]
        })
        .then(issue => {
            if (issue._complete || issue._closed) res.error.send('Completed/closed issues can not be deleted');
            else {
                if (issue.lines.filter(e => e.return_line_id).length === 0) {
                    db.destroy({
                        table: m.issue_lines,
                        where: {issue_id: req.params.id}
                    })
                    .then(result => {
                        db.destroy({
                            table: m.issues,
                            where: {issue_id: req.params.id}
                        })
                        .then(result => res.send({result: true, message: 'Issue deleted'}))
                        .catch(err => res.error.send(err, res));
                    })
                    .catch(err => res.error.send(err, res));
                } else res.error.send('Returned issue lines can not be deleted');
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/issue_lines/:id',  isLoggedIn, allowed('issue_line_delete',  {send: true}), (req, res) => {
        db.findOne({
            table: m.issue_lines,
            where: {line_id: req.params.id}
        })
        .then(line => {
            if (line.return_line_id) res.error.send('Returned issue lines can not be deleted')
            else {
                db.destroy({
                    table: m.issue_lines,
                    where: {line_id: req.params.id}
                })
                .then(result => res.send({result: true, message: 'Line deleted'}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};