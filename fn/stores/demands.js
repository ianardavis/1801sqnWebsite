module.exports = function (m, demands) {
    demands.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.suppliers.findOne({
                where: {supplier_id: options.supplier_id},
                attributes: ['supplier_id']
            })
            .then(supplier => {
                if (!supplier) resolve({success: false, message: 'Supplier not found'})
                else {
                    return m.stores.demands.findOrCreate({
                        where: {
                            supplier_id: supplier.supplier_id,
                            _status: 1
                        },
                        defaults: {user_id: options.user_id}
                    })
                    .then(([demand, created]) => {
                        if (created) resolve({success: true, message: 'Demand created',        demand: {demand_id: demand.demand_id, created: created}})
                        else         resolve({success: true, message: 'Demand already exists', demand: {demand_id: demand.demand_id, created: created}});
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    demands.createLine = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.sizes.findOne({
                where: {size_id: options.size_id},
                attributes: ['size_id', 'supplier_id', '_demand_page', '_demand_cell']
            })
            .then(size => {
                if      (!size)                                          resolve({success: false, message: 'Size not found'})
                else if (!size._demand_page || size._demand_page === '') resolve({success: false, message: 'No demand page for this size'})
                else if (!size._demand_cell || size._demand_cell === '') resolve({success: false, message: 'No demand cell for this size'})
                else {
                    return m.stores.demands.findOne({
                        where: {demand_id: options.demand_id},
                        attributes: ['demand_id', 'supplier_id', '_status']
                    })
                    .then(demand => {
                        if      (!demand)                                 resolve({success: false, message: 'Demand not found'})
                        else if (demand._status !== 1)                    resolve({success: false, message: 'Lines can only be added to draft demands'})
                        else if (size.supplier_id !== demand.supplier_id) resolve({success: false, message: 'Size is not from this supplier'})
                        else {
                            return m.stores.demand_lines.findOrCreate({
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
                                if (created) resolve({success: true, message: 'Demand line created', line: {line_id: line.line_id, created: created}})
                                else {
                                    return line.increment('_qty', {by: options._qty})
                                    .then(result => {
                                        return m.stores.notes.create({
                                            _id: line.line_id,
                                            _table: 'demand_lines',
                                            _note: `Incremented by ${options._qty}${options.note || ''}`,
                                            user_id: options.user_id,
                                            _system: 1
                                        })
                                        .then(note => resolve({success: true, message: 'Demand line created', line: {line_id: line.line_id, created: created}}))
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