module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //ASYNC GET
    app.get('/stores/getreturnlines',       isLoggedIn, allowed('access_return_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.return_lines,
            req.query
        )
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/getreturnlinesbysize', isLoggedIn, allowed('access_return_lines', {send: true}), (req, res) => {
        fn.getAll(
            m.return_lines,
            [inc.stock({
                as: 'stock',
                where: req.query,
                required: true
        })])
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/getreturns',           isLoggedIn, allowed('access_returns',      {send: true}), (req, res) => {
        fn.getAllWhere(
            m.returns,
            req.query
        )
        .then(returns => res.send({result: true, returns: returns}))
        .catch(err => fn.send_error(err, res));
    });

    //POST
    app.post('/stores/returns',             isLoggedIn, allowed('return_line_add',          {send: true}), (req, res) => {
        let actions = [];
        for (let [lineID, line] of Object.entries(req.body.return)) {
            if (line.stock_id !== '') {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                actions.push(return_issue_line(line, req.user.user_id));
            };
        };
        Promise.allSettled(actions)
        .then(results => {
            if (fn.promise_results(results)) res.send({result: true, message: 'Lines returned'})
            else fn.send_error('Some lines failed', res);
        })
        .catch(err => fn.send_error(err, res));
    });
    function return_issue_line(line, user_id) {
        return new Promise((resolve, reject) => {
            fn.getOne(
                m.issue_lines,
                {line_id: line.line_id},
                {include: [inc.issues()]}
            )
            .then(issue_line => {
                if (Number(line._qty) > Number(issue_line._qty)) {
                    reject(new Error('Returned quantity greater than issued quantity'));
                } else {
                    fn.createReturn(
                        {
                            from: issue_line.issue.issued_to,
                            user_id: user_id
                        }
                    )
                    .then(_return => {
                        fn.createReturnLine({
                            return_id: _return.return_id,
                            size_id: issue_line.size_id,
                            stock_id: line.stock_id,
                            issue_line_id: issue_line.line_id,
                            _qty: line._qty,
                            user_id: user_id,
                            serial_id: issue_line.serial_id
                        })
                        .then(return_line_id => {
                            if (Number(line._qty) === Number(issue_line._qty)) {
                                fn.update(
                                    m.issue_lines,
                                    {return_line_id: return_line_id},/////////////////////////
                                    {line_id: issue_line.line_id}
                                )
                                .then(result => resolve(true))
                                .catch(err => reject(err));
                            } else {
                                let actions = [];
                                actions.push(
                                    fn.decrement(
                                        issue_line.line_id,
                                        line._qty,
                                        'issue_lines'
                                    )
                                );
                                actions.push(
                                    fn.createNote({
                                        table: 'issues',
                                        id: issue_line.issue_id,
                                        note: 'Line partially returned: ' + issue_line._line,
                                        user_id: user_id,
                                        system: true
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
                                actions.push(
                                    fn.create(
                                        m.issue_lines,
                                        new_issue_line
                                    )
                                );
                                Promise.allSettled(actions)
                                .then(results => {
                                    if (fn.promise_results(results)) resolve(return_line_id)
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
};