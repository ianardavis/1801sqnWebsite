module.exports = function (m, demands) {
    demands.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.suppliers.findOne({
                where:      {supplier_id: options.supplier_id},
                attributes: ['supplier_id']
            })
            .then(supplier => {
                if (!supplier) reject(new Error('Supplier not found'))
                else {
                    return m.demands.findOrCreate({
                        where: {
                            supplier_id: supplier.supplier_id,
                            _status:     1
                        },
                        defaults: {user_id: options.user_id}
                    })
                    .then(([demand, created]) => resolve({success: true, demand_id: demand.demand_id, created: created}))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    demands.createLine = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.sizes.findOne({
                where: {size_id: options.size_id},
                attributes: ['size_id', 'supplier_id', '_demand_page', '_demand_cell']
            })
            .then(size => {
                if      (!size)              reject(new Error('Size not found'))
                else if (!size._demand_page) reject(new Error('No demand page for this size'))
                else if (!size._demand_cell) reject(new Error('No demand cell for this size'))
                else {
                    return m.demands.findOne({
                        where: {demand_id: options.demand_id},
                        attributes: ['demand_id', 'supplier_id', '_status']
                    })
                    .then(demand => {
                        if      (!demand)                                 reject(new Error('Demand not found'))
                        else if (demand._status !== 1)                    reject(new Error('Lines can only be added to draft demands'))
                        else if (size.supplier_id !== demand.supplier_id) reject(new Error('Size is not from this supplier'))
                        else {
                            return m.demand_lines.findOrCreate({
                                where: {
                                    demand_id: demand.demand_id,
                                    size_id: size.size_id
                                },
                                defaults: {
                                    _qty: options._qty,
                                    user_id: options.user_id
                                }
                            })
                            .then(([line, created]) => {
                                if (created) resolve({success: true, line_id: line.line_id, created: created})
                                else {
                                    return line.increment('_qty', {by: options._qty})
                                    .then(result => {
                                        return m.notes.create({
                                            _id: line.line_id,
                                            _table: 'demand_lines',
                                            _note: `Incremented by ${options._qty}${options.note || ''}`,
                                            user_id: options.user_id,
                                            _system: 1
                                        })
                                        .then(note => resolve({success: true, line_id: line.line_id, created: created}))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                };
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};