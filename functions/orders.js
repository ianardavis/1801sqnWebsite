module.exports = function (m, fn) {
    fn.orders = {};
    fn.orders.create = function (line, user_id, issue_id = null) {
        return new Promise((resolve, reject) => {
            return m.sizes.findOne({where: {size_id: line.size_id}})
            .then(size => {
                if      (!size)           reject(new Error('Size not found'))
                else if (!size.orderable) reject(new Error('This size can not ordered'))
                else {
                    return m.orders.findOrCreate({
                        where: {
                            size_id: size.size_id,
                            status:  1
                        },
                        defaults: {
                            qty:     line.qty,
                            user_id: user_id
                        }
                    })
                    .then(([order, created]) => {
                        let actions = [];
                        if (!created) {
                            actions.push(order.increment('qty', {by: line.qty}));
                            actions.push(
                                fn.actions.create({
                                    action:  `Order incremented${(issue_id ? ' from issue' : '')}`,
                                    user_id: user_id,
                                    links: [
                                        {table: 'issues', id: issue_id},
                                        {table: 'orders', id: order.order_id}
                                    ]
                                })
                            )
                        } else if (issue_id) actions.push(
                            fn.actions.create({
                                action:  'Order created from issue',
                                user_id: user_id,
                                links: [
                                    {table: 'issues', id: issue_id},
                                    {table: 'orders', id: order.order_id}
                                ]
                            })
                        );
                        return Promise.all(actions)
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.orders.demand = function (orders, user_id) {
        return new Promise((resolve, reject) => {
            return fn.allowed(user_id, 'demand_line_add')
            .then(result => {

            })
            .catch(err => reject(err));
        });
    };
};