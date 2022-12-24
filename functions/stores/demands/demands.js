module.exports = function (m, fn) {
    const line_status = {0: "Cancelled", 1: "Pending", 2: "Open", 3: "Closed"};
    function create_demand_action(action, demand_id, user_id) {
        return new Promise(resolve => {
            console.log('creating action', demand_id);
            fn.actions.create(
                `DEMAND | ${action}`,
                user_id,
                [{table: 'demands', id: demand_id}]
            )
            .then(action => resolve(true));
        });
    };
    
    fn.demands.get = function (demand_id, include = []) {
        return new Promise((resolve, reject) => {
            m.demands.findOne({
                where:   {demand_id: demand_id},
                include: include
            })
            .then(demand => {
                if (demand) {
                    resolve(demand);
                    
                } else {
                    reject(new Error('Demand not found'));
                    
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.create   = function (supplier_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get(supplier_id)
            .then(supplier => {
                m.demands.findOrCreate({
                    where: {
                        supplier_id: supplier.supplier_id,
                        status: 1
                    },
                    defaults: {user_id: user_id}
                })
                .then(([demand, created]) => {
                    if (created) {
                        create_demand_action('CREATED', demand.demand_id, user_id)
                        .then(result => resolve(demand.demand_id));
                    } else {
                        resolve(demand.demand_id);
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function complete_check(demand_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get(
                demand_id,
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
            .catch(err => reject(err));
        });
    };
    fn.demands.complete = function (demand_id, user) {
        return new Promise((resolve, reject) => {
            complete_check(demand_id)
            .then(demand => {
                let actions = [demand.update({status: 2})];
                demand.lines.forEach(l => actions.push(l.update({status: 2})));
                Promise.all(actions)
                .then(result => {
                    create_demand_action(
                        'COMPLETED',
                        demand.demand_id,
                        user.user_id
                    )
                    .then(result => {
                        fn.demands.file.create(demand_id, user)
                        .then(filename => resolve(`Filename: ${filename}`))
                        .catch(err => {
                            console.log(err);
                            resolve(`Could not raise file: ${err.message}`);
                        });
                    });
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function cancel_check(demand_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get(
                demand_id,
                [{model: m.demand_lines, as: 'lines', where: {status: 3}, required: false}]
            )
            .then(demand => {
                if ([0, 3].includes(demand.status)) {
                    reject(new Error(`This demand has already been ${line_status[demand.status].toLowerCase()}`));
                } else if (demand.lines.length > 0)        {
                    reject(new Error('You can not cancel a demand with received lines'));
                } else {
                    resolve(demand);
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.cancel   = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            cancel_check(demand_id)
            .then(demand => {
                Promise.all([
                    demand.update({status: 0}),
                    cancel_open_demand_lines(demand.demand_id, user_id)
                ])
                .then(result => {
                    if (result) {
                        create_demand_action('CANCELLED', demand.demand_id, user_id)
                        .then(result => resolve(true));

                    } else {
                        reject(new Error('Demand not updated'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function cancel_open_demand_lines(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.lines.getAll({
                demand_id: demand_id,
                status: {[fn.op.or]: [1, 2]}
            })
            .then(lines => {
                let line_actions = [];
                lines.forEach(line => {
                    line_actions.push(
                        fn.demands.lines.cancel(
                            line.demand_line_id,
                            user_id
                        )
                    );
                });
                Promise.all(line_actions)
                .then(results => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
    };

    fn.demands.close    = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get(demand_id)
            .then(demand => {
                if (demand.status !== 2) {
                    reject(new Error('This demand is not complete'));
                } else {
                    fn.demands.lines.getAll(
                        {
                            demand_id: demand_id,
                            status: {[fn.op.or]: [1, 2]}
                        },
                        [],
                        {allowNull: true}
                    )
                    .then(lines => {
                        if (lines && lines.length > 0) {
                            reject(new Error('This demand has pending or open lines'));
                        } else {
                            demand.update({status: 3})
                            .then(result => {
                                create_demand_action('CLOSED', demand.demand_id, user_id)
                                .then(result => resolve(true));
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
    fn.demands.download = function (req, res) {
        fn.demands.get(req.params.id)
        .then(demand => {
            if (demand.filename) {
                fn.fs.download('demands', demand.filename, res);

            } else {

                fn.demands.file.create(demand.demand_id, req.user)
                .then(file => {
                    fn.fs.download('demands', file, res);
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    };
};