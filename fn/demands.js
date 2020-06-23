module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        options.m.suppliers.findOne({
            where: {supplier_id: options.demand.supplier_id}
        })
        .then(supplier => {
            if (supplier) {
                options.m.demands.findOne({
                    where: {
                        supplier_id: supplier.supplier_id,
                        _complete: 0
                    }
                })
                .then(demand => {
                    if (demand) resolve({demand_id: demand.demand_id, created: false})
                    else {
                        options.m.demands.create(options.demand)
                        .then(new_demand => resolve({demand_id: new_demand.demand_id, created: true}))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            } else reject(new Error('Supplier not found'));
        })
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        options.m.sizes.findOne({
            where: {size_id: options.line.size_id}
        })
        .then(size => {
            if (size) {
                options.m.demands.findOne({
                    where: {demand_id: options.line.demand_id}
                })
                .then(demand => {
                    if (!demand) reject(new Error('Demand not found'))
                    else if (demand._complete) reject(new Error('Lines can not be added to completed demands'))
                    else if (size.supplier_id !== demand.supplier_id) reject(new Error('Size is not for this supplier'))
                    else {
                        options.m.demand_lines.findOne({
                            where: {
                                demand_id: demand.demand_id,
                                size_id: size.size_id
                            }
                        })
                        .then(demandline => {
                            if (demandline) {
                                options.m.demand_lines.findByPk(demandline.line_id)
                                .then(line => line.increment('_qty', {by: options.line._qty}))
                                .then(line => resolve(demandline.line_id))
                                .catch(err => reject(err));
                            } else {
                                options.m.demand_lines.create(options.line)
                                .then(line => resolve(line.line_id))
                                .catch(err => reject(err));
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            } else reject(new Error('Size not found'));
        })
        .catch(err => reject(err));
    })
};