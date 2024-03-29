module.exports = function (m, fn) {
    const lineStatus = {
        0: "Cancelled", 
        1: "Pending", 
        2: "Open", 
        3: "Closed"
    };
    
    fn.demands.count = function (where) { return m.demands.count({where: where}) };
    
    fn.demands.find = function (where, include = []) {
        return fn.find(
            m.demands,
            where,
            include
        );
    };
    fn.demands.findAll = function (query) {
        return m.demands.findAndCountAll({
            where: query.where,
            include: [
                fn.inc.users.user(),
                fn.inc.stores.supplier()
            ],
            ...fn.pagination(query)
        });
    };
    fn.demands.findUsers = function (demand_id) {
        return m.users.findAll({
            order:      [['surname', 'ASC']],
            attributes: ["user_id", "full_name", "surname", "first_name"],
            include:    [
                fn.inc.users.rank(),
                {
                    model:    m.issues,
                    required: true,
                    include:  [{
                        model:    m.orders,
                        where:    {status: 2},
                        required: true,
                        include:  [{
                            model:    m.demand_lines,
                            where:    {status: 2},
                            required: true,
                            include:  [{
                                model:    m.demands,
                                where:    {demand_id: demand_id},
                                required: true
                            }]
                        }]
                    }] 
                }
            ]
        });
    };
    
    fn.demands.create = function (supplier_id, user_id, return_append = []) {
        function createDemand(supplier) {
            return new Promise((resolve, reject) => {
                m.demands.findOrCreate({
                    where: {
                        supplier_id: supplier.supplier_id,
                        status: 1
                    },
                    defaults: {user_id: user_id}
                })
                .then(([demand, created]) => {
                    if (created) {
                        fn.actions.create([
                            'DEMAND | CREATED',
                            user_id,
                            [{_table: 'demands', id: demand.demand_id}]
                        ])
                        .then(result => resolve(demand));

                    } else {
                        resolve(demand);

                    };
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            fn.suppliers.find({supplier_id: supplier_id})
            .then(createDemand)
            .then(demand => resolve([demand].concat(return_append)))
            .catch(reject);
        });
    };

    fn.demands.complete = function (demand_id, user) {
        function check(demand_id) {
            return new Promise((resolve, reject) => {
                fn.demands.find(
                    {demand_id: demand_id},
                    [{
                        model: m.demand_lines,
                        as: 'lines',
                        where: {status: 1},
                        required: false,
                        include: [m.orders]
                    }]
                )
                .then(demand => {
                    if (demand.status !== 1) {
                        reject(new Error('This demand is not in draft'));
    
                    } else if (demand.lines.length === 0) {
                        reject(new Error('No pending lines for this demand'));
    
                    } else {
                        resolve(demand);
    
                    };
                })
                .catch(reject);
            });
        };
        function updateDemandAndLines(demand) {
            return new Promise((resolve, reject) => {
                let actions = [fn.update(demand, {status: 2})];
                demand.lines.forEach(line => actions.push(fn.update(line, {status: 2})));
                Promise.all(actions)
                .then(result => resolve([
                    'DEMAND | COMPLETED',
                    user.user_id,
                    [{_table: 'demands', id: demand.demand_id}],
                    [demand.demand_id, user]
                ]))
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            check(demand_id)
            .then(updateDemandAndLines)
            .then(fn.actions.create)
            .then(fn.demands.file.create)
            .then(filename => resolve(`Filename: ${filename}`))
            .catch(reject);
        });
    };

    fn.demands.cancel = function (demand_id, user_id) {
        function check(demand_id) {
            return new Promise((resolve, reject) => {
                fn.demands.find(
                    {demand_id: demand_id},
                    [{model: m.demand_lines, as: 'lines', where: {status: 3}, required: false}]
                )
                .then(demand => {
                    if ([0, 3].includes(demand.status)) {
                        reject(new Error(`This demand has already been ${lineStatus[demand.status].toLowerCase()}`));
    
                    } else if (demand.lines.length > 0)        {
                        reject(new Error('You can not cancel a demand with received lines'));
    
                    } else {
                        resolve(demand);
    
                    };
                })
                .catch(reject);
            });
        };
        function updateDemandAndLines(demand) {
            return new Promise((resolve, reject) => {
                Promise.all([
                    fn.update(demand, {status: 0}),
                    cancelOpenDemandLines(demand.demand_id)
                ])
                .then(result => resolve(['CANCELLED', demand.demand_id, user_id]))
                .catch(reject);
            });
        };
        function cancelOpenDemandLines(demand_id) {
            return new Promise((resolve, reject) => {
                fn.demands.lines.findAll({
                    demand_id: demand_id,
                    status: {[fn.op.or]: [1, 2]}
                })
                .then(lines => {
                    let actions = [];
                    lines.forEach(demand_line => {
                        actions.push(
                            fn.demands.lines.cancel(
                                demand_line.line_id,
                                user_id
                            )
                        );
                    });
                    Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(reject);
                })
                .catch(reject);
            })
        };
        return new Promise((resolve, reject) => {
            check(demand_id)
            .then(updateDemandAndLines)
            .then(fn.actions.create)
            .then(result => resolve(true))
            .catch(reject);
        });
    };

    fn.demands.close = function (demand_id, user_id) {
        function check(demand_id) {
            return new Promise((resolve, reject) => {
                fn.demands.find(
                    {demand_id: demand_id},
                    [{
                        model: m.demand_lines,
                        as: 'lines',
                        where: {status: {[fn.op.or]: [1, 2]}},
                        required: false
                    }]
                )
                .then(demand => {
                    if (demand.status !== 2) {
                        reject(new Error('This demand is not complete'));
    
                    } else if (demand.lines && demand.lines.length > 0) {
                        reject(new Error('This demand has pending or open lines'));
                        
                    } else {
                        resolve(demand);
    
                    };
                })
                .catch(reject);
            });
        };
        function updateDemand(demand) {
            return new Promise((resolve, reject) => {
                fn.update(demand, {status: 3})
                .then(result => {
                    resolve([
                        'DEMAND | CLOSED',
                        user_id,
                        [{_table: 'demands', id: demand.demand_id}]
                    ]);
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            check(demand_id)
            .then(updateDemand)
            .then(fn.actions.create)
            .then(result => resolve(true))
            .catch(reject);
        });
    };

    fn.demands.download = function (req, res) {
        fn.demands.find({demand_id: req.params.id})
        .then(demand => {
            if (demand.filename) {
                fn.fs.download('demands', demand.filename, res);

            } else {
                fn.demands.file.create([demand.demand_id, req.user])
                .then(file => fn.fs.download('demands', file, res))
                .catch(err => fn.sendError(res, err));

            };
        })
        .catch(err => fn.sendError(res, err));
    };
};