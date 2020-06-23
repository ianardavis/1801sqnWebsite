module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        options.m.orders.findOne({
            where: {
                ordered_for: options.order.ordered_for,
                _complete: 0
            }
        })
        .then(order => {
            if (order) resolve({created: false, order_id: order.order_id})
            else {
                options.m.orders.create(options.order)
                .then(new_order => resolve({created: true, order_id: new_order.order_id}))
                .catch(err => reject(err));
            };
        })
        .catch(err => res.error.send(err, res));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        options.m.sizes.findOne({where: {size_id: options.line.size_id}})
        .then(size => {
            if (!size) reject(new Error('Size not found'))
            else if (size._orderable) {
                options.m.orders.findOne({where: {order_id: options.line.order_id}})
                .then(order => {
                    if (!order) reject(new Error('Order not found'))
                    else if (order._complete) reject(new Error('Lines can not be added to completed orders'))
                    else {
                        options.m.order_lines.findOne({
                            where: {
                                order_id: order.order_id,
                                size_id: size.size_id
                            }
                        })
                        .then(orderline => {
                            if (orderline) {
                                options.m.order_lines.findByPk(orderline.line_id)
                                .then(stock => stock.increment('_qty', {by: options.line._qty}))
                                .then(stock => resolve(orderline.line_id))
                                .catch(err => reject(err));
                            } else {
                                options.m.order_lines.create(options.line)
                                .then(order_line => resolve(order_line.line_id))
                                .catch(err => reject(err));
                            };
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