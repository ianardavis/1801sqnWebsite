let increment = require(`./stock`).increment;
module.exports = function (m, returns) {
    returns.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (Number(options.return.from) === Number(options.return.user_id)) resolve({success: true, message: 'You cannot return items issued to yourself'})
            else {
                m.returns.findOrCreate({
                    where: {
                        from: options.return.from,
                        _complete: 0,
                    },
                    defaults: {user_id: options.return.user_id}
                })
                .then(_return => resolve({success: true, return_id: _return[0].return_id, created: _return[1]}))
                .catch(err => reject(err));
            };
        });
    };
    returns.createLine = function (options = {}) {
        return new Promise((resolve, reject) => {
            m.returns.findOne({where: {return_id: options.line.return_id}})
            .then(_return => {
                if      (!_return)          resolve({success: false, message: 'Return not found'})
                else if (_return._complete) resolve({success: false, message: 'Lines can not be added to completed returns'})
                else {
                    m.return_lines.create(options.line)
                    .then(return_line => {
                        let actions = [];
                        actions.push(increment({table: m.stock, id: return_line.stock_id, by: return_line._qty}));
                        if (options.line.serial_id) {
                            actions.push(m.serials.update({issue_line_id: null}, {where: {serial_id: options.line.serial_id}}));
                        };
                        Promise.allSettled(actions)
                        .then(result => {
                            if (fn.promise_results(result)) resolve({success: true, line_id: return_line.line_id})
                            else resolve({success: false, message: 'Some actions failed'});
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};