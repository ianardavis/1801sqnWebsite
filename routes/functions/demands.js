module.exports = function (m, fn) {
    fn.demands = {
        lines: {}
    };
    fn.demands.create = function (options = {}) {
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
                            status:     1
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
    fn.demands.lines.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.sizes.findOne({
                where:      {size_id: options.size_id},
                attributes: ['size_id', 'supplier_id'],
                include:    [{
                    model: m.details,
                    where: {name: {[options.op_or]:['Demand Page', 'Demand Cell']}}
                }]
            })
            .then(size => {
                if      (!size)                                               reject(new Error('Size not found'))
                else if (!size.details)                                       reject(new Error('No demand page/cell for this size'))
                else if (!size.details.filter(e => e.name === 'Demand Page')) reject(new Error('No demand page for this size'))
                else if (!size.details.filter(e => e.name === 'Demand Cell')) reject(new Error('No demand cell for this size'))
                else {
                    return m.demands.findOne({
                        where:      {demand_id: options.demand_id},
                        attributes: ['demand_id', 'supplier_id', 'status']
                    })
                    .then(demand => {
                        if      (!demand)                                 reject(new Error('Demand not found'))
                        else if (demand.status    !== 1)                  reject(new Error('Lines can only be added to draft demands'))
                        else if (size.supplier_id !== demand.supplier_id) reject(new Error('Size is not from this supplier'))
                        else {
                            return m.demand_lines.findOrCreate({
                                where: {
                                    demand_id: demand.demand_id,
                                    size_id:   size.size_id
                                },
                                defaults: {
                                    qty:     options.qty,
                                    user_id: options.user_id
                                }
                            })
                            .then(([line, created]) => {
                                if (created) resolve({success: true, line_id: line.line_id, created: created})
                                else {
                                    return line.increment('qty', {by: options.qty})
                                    .then(result => {
                                        return m.notes.create({
                                            id:      line.line_id,
                                            _table:  'demand_lines',
                                            note:    `Incremented by ${options.qty}${options.note || ''}`,
                                            user_id: options.user_id,
                                            system:  1
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