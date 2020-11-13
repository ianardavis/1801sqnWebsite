let utils     = require(process.env.ROOT + '/fn/utils'),
    increment = require(process.env.ROOT + '/fn/stores/stock').increment;
module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        if (Number(options.return.from) === Number(options.return.user_id)) {
            reject(new Error('You cannot return items issued to yourself'));
        } else {
            options.m.returns.findOrCreate({
                where: {
                    from: options.return.from,
                    _complete: 0,
                },
                defaults: {user_id: options.return.user_id}
            })
            .then(_return => resolve({return_id: _return[0].return_id, created: _return[1]}))
            .catch(err => reject(err));
        };
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        options.m.returns.findOne({where: {return_id: options.line.return_id}})
        .then(_return => {
            if (!_return) reject(new Error('Return not found'))
            else if (_return._complete) reject(new Error('Lines can not be added to completed returns'))
            else {
                options.m.return_lines.create(options.line)
                .then(return_line => {
                    let actions = [];
                    actions.push(
                        increment({
                            table: options.m.stock,
                            id: return_line.stock_id,
                            by: return_line._qty
                        })
                    );
                    if (options.line.serial_id) {
                        actions.push(
                            options.m.serials.update(
                                {issue_line_id: null},
                                {where: {serial_id: options.line.serial_id}}
                            )
                        );
                    };
                    Promise.allSettled(actions)
                    .then(result => {
                        if (utils.promiseResults(result)) resolve(return_line.line_id)
                        else reject(new Error('Some actions failed'));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    })
};