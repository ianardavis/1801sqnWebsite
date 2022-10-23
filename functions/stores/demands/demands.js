module.exports = function (m, fn) {
    const line_status = {0: "Cancelled", 1: "Pending", 2: "Open", 3: "Closed"};
    function create_demand_action(action, demand_id, user_id) {
        return new Promise(resolve => {
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
                {demand_id: demand_id},
                [{model: m.demand_lines, as: 'lines', where: {status: 1}, required: false}]
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
                demand.update({status: 2})
                .then(result => {
                    let actions = [];
                    demand.lines.forEach(line => actions.push(line.update({status: 2})))
                    Promise.all(actions)
                    .then(result => {
                        create_demand_action('COMPLETED', demand.demand_id, user.user_id)
                        .then(result => {
                            fn.demands.raise(demand.demand_id, user)
                            .then(filename => resolve({success: true, message: `Demand completed. Filename: ${filename}`}))
                            .catch(err => {
                                console.log(err);
                                resolve({success: true, message: `Demand completed. Could not raise file: ${err.message}`})
                            });
                        });
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function cancel_check(demand_id) {
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
                    if (!result) {
                        reject(new Error('Demand not updated'));
                    } else {
                        create_demand_action('CANCELLED', demand.demand_id, user_id)
                        .then(result => resolve(true));
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

    function raise_demand_check(demand_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get({demand_id: demand_id})
            .then(demand => {
                if (demand.status !== 2) {
                    reject(new Error('This demand is not complete'));
                } else {
                    resolve(demand);
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.raise    = function (demand_id, user) {
        return new Promise((resolve, reject) => {
            raise_demand_check(demand_id)
            .then(demand => {
                if (demand.filename && demand.filename !== '') {
                    resolve(demand.filename);
                } else {
                    create_file(demand)
                    .then(([file, filename, account]) => {
                        fn.demands.lines.getAll(
                            {
                                demand_id: demand.demand_id,
                                status: 2
                            },
                            [fn.inc.stores.size({details: true})]
                        )
                        .then(lines => {
                            write_cover_sheet(file, account, filename, lines, user)
                            .then(result => {
                                write_items(filename, lines, demand.supplier_id)
                                .then(fails => {
                                    demand.update({filename: filename})
                                    .then(result => resolve(filename))
                                    .catch(err => resolve(filename));
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.close    = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get({demand_id: demand_id})
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
        fn.demands.get({demand_id: req.params.id})
        .then(demand => {
            if (demand.filename) {
                fn.fs.download('demands', demand.filename, res);
            } else {
                fn.demands.raise(demand.demand_id, req.user)
                .then(file => {
                    fn.fs.download('demands', file, res);
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    };
    
    function get_orders_for_demand_line(demand_line_id, options = {}) {
        return new Promise((resolve, reject) => {
            m.action_links.findAll({
                where: {
                    _table: 'demand_lines',
                    id:     demand_line_id,
                    ...(options.active_only ? {active: true}: {})
                },
                include: [{
                    model: m.actions,
                    where: {
                        action: {[fn.op.or]:[
                            'DEMAND LINE | CREATED',
                            {[fn.op.startsWith]: 'DEMAND LINE | INCREMENTED'}
                        ]}
                    },
                    include: [{
                        model: m.action_links,
                        as: 'links',
                        where: {
                            _table: 'orders',
                            ...(options.active_only ? {active: true}: {})
                        }
                    }]
                }]
            })
            .then(links => {
                if (links) {
                    let order_actions = [];
                    links.forEach(_link => {
                        _link.action.links.forEach(link => {
                            order_actions.push(new Promise(resolve => {
                                m.orders.findOne({where: {order_id: link.id}})
                                .then(order => resolve((options.id_only ? order.order_id : order)))
                                .catch(err => {
                                    console.log(err);
                                    resolve((options.id_only ? '' : {}));
                                });
                            }));
                        });
                    });
                    return Promise.all(order_actions)
                    .then(orders => resolve({links: links, orders: orders}))
                    .catch(err => reject(err));
                } else {
                    resolve({links: [], orders: []});
                };
            })
            .catch(err => reject(err));
        });
    };
    function get_orders_for_demand_lines(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(get_orders_for_demand_line(line.demand_line_id, {id_only: true, active_only: true}));
            });
            Promise.all(actions)
            .then(results => {
                let orders = [];
                results.forEach(e => orders = orders.concat(e.orders));
                resolve(orders);
            })
            .catch(err => reject(err));
        });
    };

    function get_file(supplier_id) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get(
                supplier_id,
                [
                    fn.inc.stores.files({
                        where: {description: 'Demand'},
                        details: true
                    })
                ]
            )
            .then(supplier => {
                if (!supplier) {
                    reject(new Error('Supplier not found'));
                } else if (!supplier.files) {
                    reject(new Error('No template for this supplier'));
                } else if ( supplier.files.length === 0) {
                    reject(new Error('No demand files for this supplier'));
                } else if ( supplier.files.length > 1) {
                    reject(new Error('Multiple demand files for this supplier'));
                } else if (!supplier.account) {
                    reject(new Error('No account for this supplier'));
                } else {
                    resolve([supplier.files[0], supplier.account]);
                };
            })
            .catch(err => reject(err));
        });
    };
    function get_sizes(lines, supplier_id) {
        return new Promise((resolve, reject) => {
            let sizes = [];
            lines.forEach(line => {
                if (
                    line.size.supplier_id === supplier_id &&
                    line.size.details.findIndex(e => e.name === 'Demand Page') !== -1 &&
                    line.size.details.findIndex(e => e.name === 'Demand Cell') !== -1
                ) {
                    let demand_page = line.size.details[line.size.details.findIndex(e => e.name === 'Demand Page')].value,
                        demand_cell = line.size.details[line.size.details.findIndex(e => e.name === 'Demand Cell')].value;
                    if (demand_page && demand_cell) {
                        let sizeIndex = sizes.findIndex(e => e.size_id === line.size_id);
                        if (sizeIndex === -1) {
                            sizes.push({
                                size_id: line.size_id,
                                qty:     line.qty,
                                page:    demand_page,
                                cell:    demand_cell
                            })
                        } else {
                            sizes[sizeIndex].qty += line.qty;
                        };
                    };
                };
            });
            if (sizes.length > 0) {
                resolve(sizes);
            } else {
                reject(new Error('No sizes for this supplier with demand details'));
            };
        });
    };
    function get_users(orders) {
        return new Promise((resolve, reject) => {
            let actions = [];
            orders.forEach(order_id => {
                actions.push(
                    new Promise((resolve, reject) => {
                        m.action_links.findAll({
                            where: {
                                _table: 'issues',
                                active: true
                            },
                            include: [{
                                model: m.actions,
                                where: {
                                    action: {[fn.op.or]: [
                                        'ORDER | CREATED',
                                        {[fn.op.startsWith]: 'ORDER | INCREMENTED'}
                                    ]}
                                },
                                include: [{
                                    model: m.action_links,
                                    as: 'links',
                                    where: {
                                        _table: 'orders',
                                        id: order_id,
                                        active: true
                                    }
                                }]
                            }]
                        })
                        .then(links => {
                            if (!links || links.length === 0) {
                                resolve([]);

                            } else {
                                let get_issues = [];
                                links.forEach(e => get_issues.push(fn.issues.get({issue_id: e.id})));
                                Promise.allSettled(get_issues)
                                .then(results => {
                                    let users = [];
                                    results
                                        .filter(e => e.status === 'fulfilled')
                                        .forEach(result => {
                                            if (result.value.user_issue) users.push(result.value.user_issue)
                                        });
                                    resolve(users);
                                })
                                .catch(err => reject(err));

                            };
                        })
                        .catch(err => reject(err))
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                let users = [];
                results.filter(e => e.status === 'fulfilled' && e.value.length > 0).forEach(e => {
                    e.value.forEach(user => {
                        if (users.findIndex(e => e.user_id === user.user_id) === -1) {
                            users.push({
                                user_id: user.user_id,
                                name:    user.full_name,
                                rank:    user.rank.rank
                            })
                        };
                    });
                });
                resolve(users);
            })
            .catch(err => reject(err));
        });
    };
    function create_file(demand) {
        return new Promise((resolve, reject) => {
            get_file(demand.supplier_id)
            .then(([file, account]) => {
                const fs = require('fs');
                if (file.filename) {
                    const filename = `${demand.demand_id}.xlsx`;
                    const from = fn.public_file('files', file.filename);
                    const to   = fn.public_file('demands', filename);
                    fs.copyFile(
                        from,
                        to,
                        function (err) {
                            if (err) {
                                reject(new Error(err))
                            } else {
                                resolve([file, filename, account]);
                            };
                        }
                    );
                } else {
                    reject(new Error('No demand file specified'));
                };
            })
            .catch(err => reject(err));
        });
    };
    function counter() {
        let count = 0;
        return () => {
            return ++count;
        };
    };
    function get_cells(file) {
        let cells = {};
        [
            'code',
            'name',
            'rank',
            'holder',
            'squadron',
            'date',
            'rank column',
            'name column',
            'user start',
            'user end'
        ].forEach(e => {
            const detail = file.details.filter(d => d.name.toLowerCase() === e)
            if (detail.length === 1) {
                cells[e.replace(' ', '_')] = detail[0].value
            };
        });
        return cells;
    };
    function write_cover_sheet(file, account, filename, lines, raised_by_user) {
        return new Promise((resolve, reject) => {
            get_orders_for_demand_lines(lines)
            .then(order_ids => {
                get_users(order_ids)
                .then(users => {
                    const cover_sheet = file.details.filter(d => d.name.toLowerCase() === 'cover sheet')[0].value;
                    if (cover_sheet) {
                        const path    = fn.public_file('demands', filename);
                        const excel   = require('exceljs');
                        let workbook  = new excel.Workbook();
                        workbook.xlsx.readFile(path)
                        .then(() => {
                            try {
                                const cells = get_cells(file);
                                let worksheet = workbook.getWorksheet(cover_sheet);
                                function set_cell(cell, value) {
                                    worksheet.getCell(cell).value = value;
                                };
                                if (cells.code)     set_cell(cells.code,     account.number);
                                if (cells.name)     set_cell(cells.name,     raised_by_user.full_name);
                                if (cells.rank)     set_cell(cells.rank,     raised_by_user.rank.rank);
                                if (cells.holder)   set_cell(cells.holder,   `${account.user.rank.rank} ${account.user.full_name}`);
                                if (cells.squadron) set_cell(cells.squadron, account.name);
                                if (cells.date)     set_cell(cells.date,     new Date().toDateString());
                                if (
                                    users &&
                                    cells.rank_column &&
                                    cells.name_column &&
                                    cells.user_start  &&
                                    cells.user_end
                                ) {
                                    let line = new counter();
                                    for (let r = Number(cells.user_start); r <= Number(cells.user_end); r++) {
                                        const currentLine = line() - 1;
                                        const sortedKeys = Object.keys(users).sort();
                                        const user = users[sortedKeys[currentLine]];
                                        if (user) {
                                            set_cell(cells.rank_column + r, user.rank);
                                            set_cell(cells.name_column + r, user.name);
                                        } else {
                                            break;
                                        };
                                    };
                                };
                                workbook.xlsx.writeFile(path)
                                .then(() => resolve(true))
                                .catch(err => reject(err));
                            } catch (err) {
                                reject(err);
                            };
                        })
                        .catch(err => reject(err));
                    } else {
                        reject(new Error('No cover sheet specified'));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function write_items(filename, lines, supplier_id) {
        return new Promise((resolve, reject) => {
            get_sizes(lines, supplier_id)
            .then(sizes => {
                let ex       = require('exceljs');
                let workbook = new ex.Workbook();
                const path = fn.public_file('demands', filename);
                workbook.xlsx.readFile(path)
                .then(() => {
                    let fails = [];
                    sizes.forEach(size => {
                        try {
                            let worksheet = workbook.getWorksheet(size.page),
                                cell      = worksheet.getCell(size.cell);
                            cell.value = size.qty;
                        } catch (err) {
                            fails.push({size_id: size.size_id, reason: err.message});
                        };
                    });
                    workbook.xlsx.writeFile(path)
                    .then(() => resolve(fails))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};