module.exports = function (m, fn) {
    const line_status = {0: "Cancelled", 1: "Pending", 2: "Open", 3: "Closed"};
    
    fn.demands.count = function (where) { return m.demands.count({where: where}) };
    
    fn.demands.get = function (where, include = []) {
        return new Promise((resolve, reject) => {
            m.demands.findOne({
                where:   where,
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
    fn.demands.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.demands.findAndCountAll({
                where: where,
                include: [
                    fn.inc.users.user(),
                    fn.inc.stores.supplier()
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    fn.demands.get_users = function (demand_id) {
        return new Promise((resolve, reject) => {
            m.issues.findAll({
                include: [
                    fn.inc.users.user({as: 'user_issue'}),
                    {
                        model: m.orders,
                        where: {status: 2},
                        required: true,
                        include: [{
                            model: m.demand_lines,
                            where: {status: 2},
                            required: true,
                            include: [{
                                model: m.demands,
                                where: {demand_id: demand_id},
                                required: true
                            }]
                        }]
                    }
                ] 
            })
            .then(issues => {
                let users = [];
                issues.forEach(issue => {
                    if (users.findIndex(e => e.user_id === issue.user_issue.user_id) === -1) {
                        users.push({
                            user_id: issue.user_issue.user_id,
                            name:    issue.user_issue.full_name,
                            rank:    issue.user_issue.rank.rank
                        });
                    };
                });
                resolve(users);
            })
            .catch(err => reject(err));
        });
    };
    
    fn.demands.create = function (supplier_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get({supplier_id: supplier_id})
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
                        fn.actions.create(
                            'DEMAND | CREATED',
                            user_id,
                            [{_table: 'demands', id: demand.demand_id}]
                        )
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

    function complete_check(demand_id, user) {
        return new Promise((resolve, reject) => {
            fn.demands.get(
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
                    resolve(demand, user);

                };
            })
            .catch(err => reject(err));
        });
    };
    function complete_update_lines(demand, user) {
        return new Promise((resolve, reject) => {
            let actions = [demand.update({status: 2})];
            demand.lines.forEach(l => actions.push(l.update({status: 2})));
            Promise.all(actions)
            .then(result => resolve(
                'DEMAND | COMPLETED',
                user.user_id,
                [{_table: 'demands', id: demand.demand_id}],
                [demand.demand_id, user]))
            .catch(err => reject(err));
        });
    };
    fn.demands.complete = function (demand_id, user) {
        return new Promise((resolve, reject) => {
            complete_check(demand_id, user)
            .then(complete_update_lines)
            .then(fn.actions.create)
            .then(fn.demands.file.create)
            .then(filename => resolve(`Filename: ${filename}`))
            .catch(err => reject(err));
        });
    };

    function cancel_check(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get(
                {demand_id: demand_id},
                [{model: m.demand_lines, as: 'lines', where: {status: 3}, required: false}]
            )
            .then(demand => {
                if ([0, 3].includes(demand.status)) {
                    reject(new Error(`This demand has already been ${line_status[demand.status].toLowerCase()}`));

                } else if (demand.lines.length > 0)        {
                    reject(new Error('You can not cancel a demand with received lines'));

                } else {
                    resolve([demand, user_id]);

                };
            })
            .catch(err => reject(err));
        });
    };
    function cancel_update_demand_and_lines([demand, user_id]) {
        return new Promise((resolve, reject) => {
            Promise.all([
                demand.update({status: 0}),
                cancel_cancel_open_demand_lines(demand.demand_id, user_id)
            ])
            .then(result => resolve('CANCELLED', demand.demand_id, user_id))
            .catch(err => reject(err));
        });
    };
    function cancel_cancel_open_demand_lines(demand_id, user_id) {
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
    fn.demands.cancel = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            cancel_check(demand_id, user_id)
            .then(cancel_update_demand_and_lines)
            .then(fn.actions.create)
            .then(result => resolve(true))
            .catch(err => reject(err));
        });
    };

    function close_check(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get(
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
                    resolve(demand, user_id);

                };
            })
            .catch(err => reject(err));
        });
    };
    function close_update_demand(demand, user_id) {
        return new Promise((resolve, reject) => {
            demand.update({status: 3})
            .then(result => {
                if (result) {
                    resolve(
                        'DEMAND | CLOSED',
                        user_id,
                        [{_table: 'demands', id: demand.demand_id}]
                    );

                } else {
                    reject(new Error('Demand not updated'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.close = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            close_check(demand_id, user_id)
            .then(close_update_demand)
            .then(fn.actions.create)
            .then(result => resolve(true))
            .catch(err => reject(err));
        });
    };

    fn.demands.download = function (req, res) {
        fn.demands.get({demand_id: req.params.id})
        .then(demand => {
            if (demand.filename) {
                fn.fs.download('demands', demand.filename, res);

            } else {

                fn.demands.file.create([demand.demand_id, req.user])
                .then(file => {
                    fn.fs.download('demands', file, res);
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    };
};