module.exports = function (m, fn) {
    fn.demands = {lines: {}};
    fn.demands.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return getSupplier({supplier_id: options.supplier_id})
            .then(supplier => {
                return m.demands.findOrCreate({
                    where: {
                        supplier_id: supplier.supplier_id,
                        status:     1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([demand, created]) => resolve({success: true, demand_id: demand.demand_id, created: created}))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.complete = function (demand_id, user) {
        return new Promise((resolve, reject) => {
            return getDemand({demand_id: demand_id})
            .then(demand => {
                if  (demand.status !== 1) reject(new Error('This demand is not in draft'))
                else {
                    return getDemandLines({
                        demand_id: demand.demand_id,
                        status: 1
                    })
                    .then(lines => {
                        return demand.update({status: 2})
                        .then(result => {
                            if (!result) reject(new Error('demand not updated'))
                            else {
                                let actions = [];
                                lines.forEach(line => actions.push(line.update({status: 2})))
                                return Promise.all(actions)
                                .then(result => {
                                    return fn.actions.create({
                                        action:  'Demand completed',
                                        user_id: user.user_id,
                                        links: [{table: 'demands', id: demand.demand_id}]
                                    })
                                    .then(action => {
                                        return fn.demands.raise(demand.demand_id, user)
                                        .then(filename => resolve({success: true, message: `Demand completed. Filename: ${filename}`}))
                                        .catch(err => {
                                            console.log(err);
                                            resolve({success: true, message: `Demand completed. Could not raise file: ${err.message}`})
                                        });
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            }
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.cancel = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            return m.demands.findOne({
                where: {demand_id: demand_id},
                attributes: ['demand_id', 'status']
            })
            .then(demand => {
                if      (!demand)             reject(new Error('Demand not found'))
                else if (demand.status === 0) reject(new Error('This demand has already been cancelled'))
                else if (demand.status === 3) reject(new Error('This demand has already been closed'))
                else {
                    return m.demand_lines.findOne({
                        where: {
                            demand_id: demand.demand_id,
                            status:    3
                        }
                    })
                    .then(line => {
                        if (line) reject(new Error('You can not cancel a demand with received lines'))
                        else {
                            let actions = [];
                            actions.push(demand.update({status: 0}));
                            actions.push(
                                new Promise((resolve, reject) => {
                                    return m.demand_lines.findAll({
                                        where: {
                                            demand_id: demand.demand_id,
                                            status: {[fn.op.or]: [1, 2]}
                                        }
                                    })
                                    .then(lines => {
                                        let line_actions = [];
                                        lines.forEach(line => {
                                            line_actions.push(
                                                cancel_line(
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
                            );
                            return Promise.all(actions)
                            .then(result => {
                                if (!result) reject(new Error('Demand not updated'))
                                else {
                                    return fn.actions.create({
                                        action:  'Demand cancelled',
                                        user_id: user_id,
                                        links: [{table: 'demands', id: demand.demand_id}]
                                    })
                                    .then(action => resolve(true))
                                    .catch(err => {
                                        console.log(err);
                                        resolve(new Error(`Demand cancelled. Error creating action: ${err.message}`))
                                    });
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
    fn.demands.raise = function (demand_id, user) {
        return new Promise((resolve, reject) => {
            getDemand({demand_id: demand_id})
            .then(demand => {
                if      (demand.status !== 2)                       reject(new Error('This demand is not complete'))
                else if (demand.filename && demand.filename !== '') resolve(demand.filename)
                else {
                    return get_template(demand.supplier_id)
                    .then(([template, account, supplier_id]) => {
                        return getDemandLines(
                            {
                                demand_id: demand.demand_id,
                                status: 2
                            },
                            [{
                                model:   m.sizes,
                                as:      'size',
                                include: [m.details]
                            }]
                        )
                        .then(demand_lines => {
                            return get_orders(demand_lines)
                            .then(orders => {
                                return get_sizes(demand_lines, supplier_id)
                                .then(sizes => {
                                    return get_users(orders)
                                    .then(users => {
                                        return create_file(template.filename, demand.demand_id)
                                        .then(file => {
                                            return write_cover_sheet(template, account, file, users, user)
                                            .then(result => {
                                                return write_items(file, sizes)
                                                .then(fails => {
                                                    return demand.update({filename: file})
                                                    .then(result => resolve(file))
                                                    .catch(err => resolve(file));
                                                })
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
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
    fn.demands.close = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            return getDemand({demand_id: demand_id})
            .then(demand => {
                if (demand.status !== 2) reject(new Error('This demand is not complete'))
                else {
                    return getDemandLines(
                        {
                            demand_id: demand_id,
                            status: {[fn.op.or]: [1, 2]}
                        },
                        [],
                        {allowNull: true}
                    )
                    .then(lines => {
                        if (lines && lines.length > 0) reject(new Error('This demand has pending or open lines'))
                        else {
                            return demand.update({status: 3})
                            .then(result => {
                                if (!result) reject(new Error('Demand not updated'))
                                else {
                                    return fn.actions.create({
                                        note:      'Closed',
                                        user_id:   user_id,
                                        links: [{table: 'demands', id: demand.demand_id}]
                                    })
                                    .then(action => resolve(true))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: `Demand closed. Error creating note: ${err.message}`});
                                    });
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

    fn.demands.lines.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return getSize(
                {size_id: options.size_id},
                [{
                    model: m.details,
                    where: {name: {[fn.op.or]:['Demand Page', 'Demand Cell']}}
                }]
            )
            .then(size => {
                if      (!size.details)                                       reject(new Error('No demand page/cell for this size'))
                else if (!size.details.filter(e => e.name === 'Demand Page')) reject(new Error('No demand page for this size'))
                else if (!size.details.filter(e => e.name === 'Demand Cell')) reject(new Error('No demand cell for this size'))
                else {
                    return getDemand({demand_id: options.demand_id})
                    .then(demand => {
                        if      (demand.status    !== 1)                  reject(new Error('Lines can only be added to draft demands'))
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
                                if (created) resolve(line.demand_line_id)
                                else {
                                    return line.increment('qty', {by: options.qty})
                                    .then(result => {
                                        return fn.actions.create({
                                            action:  `Demand line incremented by ${options.qty}${(options.order_id ? ' by order' : '')}`,
                                            user_id: options.user_id,
                                            links: [
                                                {table: 'demand_lines', id: line.demand_line_id},
                                                ...(options.order_id ? {table: 'orders', id: options.order_id} : null)
                                            ]
                                        })
                                        .then(action => resolve(line.demand_line_id))
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
    fn.demands.lines.receive = function (line, user_id) {
        return new Promise((resolve, reject) => {
            if (!line.receipt) reject(new Error('No receipt details'))
            else {
                return getDemandLine(line.demand_line_id)
                .then(demand_line => {
                    if      (demand_line.status === 3) reject(new Error('This line has already been received'))
                    else if (demand_line.status === 1) reject(new Error('This line is still in draft'))
                    else {
                        return getSize({size_id: demand_line.size_id})
                        .then(size => {
                            let actions = [];
                            if (size.has_serials) {
                                if (!line.receipt.serials) reject(new Error('This size requires serial #, but none were submitted'))
                                else actions.push(receive_serials(line.receipt.serials, demand_line, user_id));
                            } else {
                                if (!line.receipt.location) reject(new Error('No receipt location was submitted'))
                                else actions.push(receive_stocks(line.receipt, demand_line, user_id))
                            };
                            Promise.all(actions)
                            .then(results => {
                                return m.actions.findAll({
                                    where: {
                                        demand_line_id: demand_line.demand_line_id,
                                        order_id: {[fn.op.not]: null}
                                    },
                                    include: [{model: m.orders, as: 'order'}]
                                })
                                .then(actions => {
                                    let order_actions = [];
                                    actions.forEach(action => {
                                        if (action.order && action.order.status === 2) {
                                            order_actions.push(action.order.update({status: 3}))
                                        };
                                    });
                                    return Promise.all(order_actions)
                                    .then(results => resolve(true))
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
            };
        });
    };
    fn.demands.lines.cancel = function (demand_line_id, user_id) {
        return cancel_line(demand_line_id, user_id)
    };
    function cancel_line(demand_line_id, user_id) {
        return new Promise ((resolve, reject) => {
            return m.demand_lines.findOne({where: {demand_line_id: demand_line_id}})
            .then(line => {
                if      (!line)             reject(new Error('Demand line not found'))
                else if (line.status === 0) reject(new Error('This line has already been cancelled'))
                else if (line.status === 3) reject(new Error('This line has already been received'))
                else {
                    let actions = [];
                    actions.push(line.update({status: 0}));
                    actions.push(
                        fn.actions.create({
                            action:  'Demand line cancelled',
                            user_id: user_id,
                            links: [{table: 'demand_lines', id: line.demand_line_id}]
                        })
                    );
                    actions.push(
                        new Promise((resolve, reject) => {
                            return m.actions.findAll({
                                where: {
                                    demand_line_id: line.demand_line_id,
                                    order_id:       {[fn.op.not]: null}
                                },
                                include: [{model: m.orders, as: 'order'}]
                            })
                            .then(actions => {
                                let order_actions = [];
                                actions.forEach(action => {
                                    if (action.order && action.order.status === 3) {
                                        order_actions.push(action.order.update({status: 2}));
                                        order_actions.push(
                                            fn.actions.create({
                                                action:  'Demand line cancelled',
                                                user_id: user_id,
                                                links: [{table: 'orders', id: action.order_id}]
                                            })
                                        );
                                    };
                                });
                                return Promise.allSettled(order_actions)
                                .then(results => resolve(`${results.filter(e => e.status === 'rejected').length || '0'} orders failed`))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    return Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                };

            })
            .catch(err => reject(err));
        });
    };

    function getDemand(where = {}) {
        return new Promise((resolve, reject) => {
            return m.demands.findOne({where: where})
            .then(demand => {
                if (!demand) reject(new Error('Demand not found'))
                else         resolve(demand);
            })
            .catch(err => reject(err));
        });
    };
    function getDemandLines(where = {}, include = [], options = {}) {
        return new Promise((resolve, reject) => {
            return m.demand_lines.findAll({
                where:   where,
                include: include
            })
            .then(lines => {
                if (
                    options.allowNull === true ||
                    (lines && lines.length > 0)
                )    resolve(lines)
                else reject(new Error('No lines found'));
            })
            .catch(err => reject(err));
        });
    };
    function getDemandLine(demand_line_id) {
        return new Promise((resolve, reject) => {
            return m.demand_lines.findOne({where: {demand_line_id: demand_line_id}})
            .then(line => {
                if (!line) reject(new Error('Demand line not found'))
                else resolve(line);
            })
            .catch(err => reject(err));
        });
    };
    function getSupplier(where = {}, include = []) {
        return new Promise((resolve, reject) => {
            return m.suppliers.findOne({
                where:   where,
                include: include
            })
            .then(supplier => {
                if (!supplier) reject(new Error('Supplier not found'))
                else           resolve(supplier);
            })
            .catch(err => reject(err));
        });
    };
    function getSize(where = {}, include = []) {
        return new Promise((resolve, reject) => {
            return m.sizes.findOne({
                where:   where,
                include: include
            })
            .then(size => {
                if (!size) reject(new Error('Size not found'))
                else resolve(size)
            })
            .catch(err => reject(err))
        });
    };

    function get_template(supplier_id) {
        return new Promise((resolve, reject) => {
            return getSupplier(
                {supplier_id: supplier_id},
                [
                    {
                        model:    m.files,
                        where:    {description: 'Demand'},
                        required: false,
                        include: [
                            {model: m.file_details, as: 'details'}
                        ]
                    },
                    {
                        model: m.accounts,
                        as: 'account',
                        include: [
                            {
                                model: m.users,
                                as: 'user',
                                include: [
                                    {
                                        model: m.ranks,
                                        as: 'rank'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            )
            .then(supplier => {
                if      (!supplier.files)             reject(new Error('No template for this supplier'))
                else if (supplier.files.length === 0) reject(new Error('No demand files for this supplier'))
                else if (supplier.files.length > 1)   reject(new Error('Multiple demand files for this supplier'))
                else if (!supplier.account)           reject(new Error('No account for this supplier'))
                else                                  resolve([supplier.files[0], supplier.account, supplier.supplier_id]);
            })
            .catch(err => reject(err));
        });
    };
    function get_orders(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        m.action_links.findAll({
                            where: {_table: 'orders'},
                            include: [
                                {
                                    model: m.actions,
                                    as: 'action',
                                    where: {action: 'Order added to demand'},
                                    include: [
                                        {
                                            model: m.action_links,
                                            as: 'links',
                                            where: {_table: 'demand_lines', id: line.demand_line_id},
                                            required: true
                                        }
                                    ],
                                    required: true
                                }
                            ]
                        })
                        .then(_actions => {
                            if (!_actions || _actions.length === 0) resolve([])//reject(new Error('No orders for this line'))
                            else {
                                let orders = [];
                                _actions.forEach(action => orders.push(action.id));
                                resolve(orders);
                            };
                        })
                        .catch(err => reject(err))
                    })
                );
            });
            Promise.all(actions)
            .then(results => {
                let orders = [];
                results.forEach(e => orders = orders.concat(e));
                resolve(orders);
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
                        } else sizes[sizeIndex].qty += line.qty;
                    };
                };
            });
            if (sizes.length > 0) resolve(sizes)
            else                  reject(new Error('No sizes for this supplier with demand details'));
        });
    };
    function get_users(orders) {
        return new Promise((resolve, reject) => {
            let actions = [];
            orders.forEach(order_id => {
                actions.push(
                    new Promise((resolve, reject) => {
                        m.action_links.findAll({
                            where: {_table: 'issues'},
                            include: [
                                {
                                    model: m.actions,
                                    as: 'action',
                                    where: {
                                        action: {[fn.op.or]: ['Order created from issue', 'Order incremented from issue']}
                                    },
                                    required: true,
                                    include: [
                                        {
                                            model: m.action_links,
                                            as: 'links',
                                            where: {_table: 'orders', id: order_id},
                                            required: true
                                        }
                                    ]
                                }
                            ]
                        })
                        .then(links => {
                            if (!links || links.length === 0) resolve([]) //reject(new Error('No issues for this order'))
                            else {
                                let issues = [], get_issues = [];
                                links.forEach(link => {
                                    get_issues.push(
                                        new Promise((resolve, reject) => {
                                            return m.issues.findOne({
                                                where: {issue_id: link.id},
                                                include: [{model: m.users, as: 'user_issue', include: [{model: m.ranks, as: 'rank'}]}]
                                            })
                                            .then(issue => {
                                                if      (!issue)            reject(new Error('Issue not found'))
                                                else if (!issue.user_issue) reject(new Error('User not found'))
                                                else {
                                                    issues.push(issue.user_issue);
                                                    resolve(true)
                                                };
                                            })
                                            .catch(err => reject(err));
                                        })
                                    );
                                });
                                return Promise.allSettled(get_issues)
                                .then(results => resolve(issues))
                                .catch(err => reject(err))
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
    function create_file(filename, demand_id) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            if (filename) {
                let new_file = `${demand_id}.xlsx`;
                fs.copyFile(
                    `${process.env.ROOT}/public/res/files/${filename}`,
                    `${process.env.ROOT}/public/res/demands/${new_file}`,
                    function (err) {
                        if (err) reject(new Error(err))
                        else     resolve(new_file);
                    }
                );
            } else reject(new Error('No demand file specified'));
        });
    };
    function write_cover_sheet(template, account, file, users, raised_by_user) {
        return new Promise((resolve, reject) => {
            let details = {};
            details.cover_sheet = template.details.filter(e => e.name.toLowerCase() === 'cover sheet')[0].value
            if (details.cover_sheet) {
                ['code', 'name', 'rank', 'holder', 'squadron', 'date', 'rank column', 'name column', 'user start', 'user end'].forEach(e => {
                    if (template.details.filter(d => d.name.toLowerCase() === e).length === 1) {
                        details[e.replace(' ', '_')] = template.details.filter(d => d.name.toLowerCase() === e)[0].value
                    };
                });
                let ex       = require('exceljs'),
                    workbook = new ex.Workbook(),
                    path     = `${process.env.ROOT}/public/res/demands`;
                workbook.xlsx.readFile(`${path}/${file}`)
                .then(() => {
                    try {
                        let worksheet = workbook.getWorksheet(details.cover_sheet);
                        if (details.code)     worksheet.getCell(details.code)    .value = account.number;
                        if (details.name)     worksheet.getCell(details.name)    .value = raised_by_user.full_name;
                        if (details.rank)     worksheet.getCell(details.rank)    .value = raised_by_user.rank.rank;
                        if (details.holder)   worksheet.getCell(details.holder)  .value = `${account.user.rank.rank} ${account.user.full_name}`;
                        if (details.squadron) worksheet.getCell(details.squadron).value = account.name;
                        if (details.date)     worksheet.getCell(details.date)    .value = new Date().toDateString();
                        if (
                            users &&
                            details.rank_column &&
                            details.name_column &&
                            details.user_start  &&
                            details.user_end
                        ) {
                            let line = new fn.counter();
                            for (let r = Number(details.user_start); r <= Number(details.user_end); r++) {
                                let rankCell = worksheet.getCell(details.rank_column + r),
                                    nameCell = worksheet.getCell(details.name_column + r),
                                    currentLine = line() - 1,
                                    sortedKeys = Object.keys(users).sort(),
                                    user = users[sortedKeys[currentLine]];
                                if (user) {
                                    rankCell.value = user.rank;
                                    nameCell.value = user.name;
                                } else break;
                            };
                        };
                        workbook.xlsx.writeFile(`${path}/${file}`)
                        .then(() => resolve(true))
                        .catch(err => reject(err));
                    } catch (err) {
                        reject(err);
                    };
                }).catch(err => reject(err));
            } else reject(new Error('No cover sheet specified'));
        });
    };
    function write_items(file, sizes) {
        return new Promise((resolve, reject) => {
            let ex       = require('exceljs'),
                workbook = new ex.Workbook(),
                path     = `${process.env.ROOT}/public/res/demands`;
            workbook.xlsx.readFile(`${path}/${file}`)
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
                workbook.xlsx.writeFile(`${path}/${file}`)
                .then(() => resolve(fails))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function receive_serials(serials, line, user_id) {
        return new Promise((resolve, reject) => {
            let serial_actions = [];
            serials.forEach(serial => {
                serial_actions.push(
                    new Promise((resolve, reject) => {
                        if (!serial.location) reject(new Error('No location submitted'))
                        else {
                            return m.locations.findOrCreate({where: {location: serial.location}})
                            .then(([location, created]) => {
                                return m.serials.findOrCreate({
                                    where: {
                                        size_id: line.size_id,
                                        serial:  serial.serial
                                    },
                                    defaults: {
                                        location_id: location.location_id
                                    }
                                })
                                .then(([serial, created]) => {
                                    if (!created) {
                                        if (serial.location_id || serial.issue_id) reject(new Error('This serial number already exists and is already in stock or currently issued'))
                                        else {
                                            return serial.update({location_id: location.location_id})
                                            .then(result => {
                                                if (!result) reject(new Error('Existing serial not updated'))
                                                else {
                                                    return fn.actions.create({
                                                        action:  'Received',
                                                        user_id: user_id,
                                                        links: [
                                                            {table: 'demand_lines', id: line.demand_line_id},
                                                            {table: 'locations', id: location.location_id},
                                                            {table: 'serials', id: serial.serial_id}
                                                        ]
                                                    })
                                                    .then(action => resolve(true))
                                                    .catch(err => {
                                                        console.log(err);
                                                        resolve(false);
                                                    });
                                                };
                                            })
                                            .catch(err => reject(err));
                                        }
                                    } else {
                                        return fn.actions.create({
                                            action:  'Received',
                                            user_id: user_id,
                                            links: [
                                                {table: 'demand_lines', id: line.demand_line_id},
                                                {table: 'locations', id: location.location_id},
                                                {table: 'serials', id: serial.serial_id}
                                            ]
                                        })
                                        .then(action => resolve(true))
                                        .catch(err => {
                                            console.log(err);
                                            resolve(false);
                                        });
                                    };
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        };
                    })
                );
            });
            return Promise.allSettled(serial_actions)
            .then(results => {
                let success_count = results.filter(e => e.status === 'fulfilled').length;
                if (success_count === 0) reject(new Error('No successful lines'))
                else {
                    let actions = [];
                    actions.push(line.update({status: 3}));
                    actions.push(fn.actions.create({
                        action:  'Received',
                        user_id: user_id,
                        links: [{table: 'demand_lines', id: line.demand_line_id}]
                    }));
                    return Promise.all(actions)
                    .then(result => {
                        if (success_count === line.qty) resolve(true)
                        else {
                            return line.update({qty: success_count})
                            .then(result => {
                                if (!result) reject(new Error('Line quantity not updated'))
                                else {
                                    if (success_count > line.qty) {
                                        return fn.actions.create({
                                            action:  'Quantity increased by over receipt',
                                            user_id: user_id,
                                            links: [{table: 'demand_lines', id: line.demand_line_id}]
                                        })
                                        .then(result => resolve(true))
                                        .catch(err => {
                                            console.log(err);
                                            resolve(false);
                                        });
                                    } else {
                                        return m.demand_lines.create({
                                            demand_id: line.demand_id,
                                            size:      line.size_id,
                                            qty:       line.qty - success_count,
                                            status:    2,
                                            user_id:   user_id
                                        })
                                        .then(new_line => {
                                            return fn.actions.create({
                                                action:  'Line created by partial receipt',
                                                user_id: user_id,
                                                links: [{table: 'demand_lines', id: new_line.demand_line_id}]
                                            })
                                            .then(result => resolve(true))
                                            .catch(err => {
                                                console.log(err);
                                                resolve(false);
                                            });
                                        })
                                        .catch(err => reject(err));
                                    };
                                };
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err))
                };
            })
            .catch(err => reject(err));
        })
    };
    function receive_stocks(receipt, line, user_id) {
        return new Promise((resolve, reject) => {
            return m.locations.findOrCreate({where: {location: receipt.location}})
            .then(([location, created]) => {
                return m.stocks.findOrCreate({
                    where: {
                        size_id:     line.size_id,
                        location_id: location.location_id
                    }
                })
                .then(([stock, created]) => {
                    let actions = [];
                    actions.push(stock.increment('qty', {by: receipt.qty}));
                    actions.push(line.update({status: 3}));
                    actions.push(fn.actions.create({
                        action:  'Received',
                        user_id: user_id,
                        links: [{table: 'demand_lines', id: line.demand_line_id}]
                    }));
                    Promise.all(actions)
                    .then(result => {
                        let line_actions = [];
                        if (receipt.qty !== line.qty) line_actions.push(line.update({qty: receipt.qty}));
                        if (receipt.qty < line.qty) {
                            line_actions.push(
                                new Promise((resolve, reject) => {
                                    return m.demand_lines.create({
                                        demand_id: line.demand_id,
                                        size_id:   line.size_id,
                                        qty:       line.qty - receipt.qty,
                                        status:    2,
                                        user_id:   user_id
                                    })
                                    .then(new_line => {
                                        return fn.actions.create({
                                            action:  'Created from under receipt',
                                            user_id: user_id,
                                            links: [{table: 'demand_lines', id: new_line.demand_line_id}]
                                        })
                                        .then(action => resolve(true))
                                        .catch(err => resolve(false));
                                    })
                                    .catch(err => reject(err));
                                })
                            );
                        } else if (receipt.qty > line.qty) {
                            line_actions.push(
                                new Promise(resolve => {
                                    return fn.actions.create({
                                        action:  `Quantity increased by ${receipt.qty - line.qty} due to over receipt`,
                                        user_id: user_id,
                                        links: [{table: 'demand_lines', id: line.demand_line_id}]
                                    })
                                    .then(action => resolve(true))
                                    .catch(err => resolve(false));
                                })
                            );
                        };
                        Promise.all(line_actions)
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};