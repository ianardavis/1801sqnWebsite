module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        return options.m.users.findOne(
            {where: {user_id: options.ordered_for}},
            {attributes: ['user_id']}
        )
        .then(user => {
            if (!user) reject(new Error('User not found'))
            else {
                return options.m.orders.findOrCreate({
                    where: {
                        ordered_for: user.user_id,
                        _status: 1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([order, created]) => resolve({created: created, order_id: order.order_id}))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        return options.m.sizes.findOne({
            where: {size_id: options.line.size_id},
            attributes: ['_orderable', 'size_id']
        })
        .then(size => {
            if (!size) reject(new Error('Size not found'))
            else if (size._orderable) {
                return options.m.orders.findOne({
                    where: {order_id: options.line.order_id},
                    attributes: ['_status', 'order_id']
                })
                .then(order => {
                    if (!order) reject(new Error('Order not found'))
                    else if (order._status !== 1) reject(new Error('Lines can only be added to draft orders'))
                    else {
                        return options.m.order_lines.findOrCreate({
                            where: {
                                order_id: order.order_id,
                                size_id:  size.size_id,
                                _status:  1
                            },
                            defaults: {_qty: options.line._qty}
                        })
                        .then(([line, created]) => {
                            let _note = `Line ${line.line_id} `, actions = [];;
                            if (created) _note += `created${options.note_addition || ''}`
                            else {
                                actions.push(line.increment('_qty', {by: options.line._qty}));
                                _note += `incremented by ${options.line._qty}${options.note_addition || ''}`;
                            };
                            actions.push(
                                options.m.notes.create({
                                    _id: order.order_id,
                                    _table: 'orders',
                                    _note: _note,
                                    user_id: options.line.user_id,
                                    _system: 1
                                })
                            );
                            return Promise.all(actions)
                            .then(note => resolve({line_id: line.line_id, created: created}))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            } else reject(new Error('This size can not be ordered'));
        })
        .catch(err => reject(err));
    })
};