module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let utils   = require(process.env.ROOT + '/fn/utils'),
        returns = require(process.env.ROOT + '/fn/stores/returns'),
        stock   = require(process.env.ROOT + '/fn/stores/stock');
    app.post('/stores/returns', isLoggedIn, allowed('return_line_add', {send: true}), (req, res) => {
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