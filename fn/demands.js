module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        return options.m.suppliers.findOne({
            where: {supplier_id: options.supplier_id},
            attributes: ['supplier_id']
        })
        .then(supplier => {
            if (!supplier) return reject(new Error('Supplier not found'))
            else {
                return options.m.demands.findOrCreate({
                    where: {
                        supplier_id: supplier.supplier_id,
                        _status: 1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([demand, created]) => resolve({demand_id: demand.demand_id, created: created}))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        return options.m.sizes.findOne({
            where: {size_id: options.line.size_id},
            attributes: ['size_id', 'supplier_id']
        })
        .then(size => {
            if (!size) reject(new Error('Size not found'))
            else if (!size._demand_page || size._demand_page === '' || !size._demand_cell || size._demand_cell === '') {
                reject(new Error('No demand details for this size'))
            } else {
                return options.m.demands.findOne({
                    where: {demand_id: options.line.demand_id},
                    attributes: ['demand_id', 'supplier_id', '_status']
                })
                .then(demand => {
                    if (!demand) reject(new Error('Demand not found'))
                    else if (demand._status !== 1) reject(new Error('Lines can only be added to draft demands'))
                    else if (size.supplier_id !== demand.supplier_id) reject(new Error('Size is not from this supplier'))
                    else {
                        return options.m.demand_lines.findOrCreate({
                            where: {
                                demand_id: demand.demand_id,
                                size_id: size.size_id
                            },
                            defaults: {
                                _qty: options.line._qty,
                                user_id: options.user_id
                            }
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
                                    _id: demand.demand_id,
                                    _table: 'demands',
                                    _note: _note,
                                    user_id: options.user_id,
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
            };
        })
        .catch(err => reject(err));
    })
};