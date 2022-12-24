module.exports = function (m, fn) {
    function raise_demand_check(demand_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get(
                demand_id,
                [{
                    model: m.demand_lines,
                    as: 'lines',
                    where: {status: 2},
                    include: [
                        m.orders,
                        {
                            model: m.sizes,
                            include: [
                                m.details,
                                m.items
                            ]
                        }
                    ]
                }]
            )
            .then(demand => {
                if (demand.status !== 2) {
                    reject(new Error('This demand is not complete'));

                } else if (!demand.lines || demand.lines.length === 0) {
                    reject(new Error('No valid lines for this demand'));

                } else {
                    resolve(demand);

                };
            })
            .catch(err => reject(err));
        });
    };

    function create_file(demand) {
        return new Promise((resolve, reject) => {
            Promise.all([
                get_file(demand.supplier_id),
                check_folder_exists()
            ])
            .then(([[file, account], exists]) => {
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
                                reject(new Error(err));

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
    function check_folder_exists() {
        return new Promise((resolve, reject) => {
            fn.fs.folder_exists('demands')
            .then(path => resolve(true))
            .catch(err => {
                fn.fs.mkdir('demands')
                .then(path => resolve(true))
                .catch(err => reject(err));
            });
        });
    };
    
    function write_cover_sheet(file, account, filename, raised_by_user, demand_id) {
        return new Promise((resolve, reject) => {
            get_users(demand_id)
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
        });
    };
    function get_users(demand_id) {
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
    function counter() {
        let count = 0;
        return () => {
            return ++count;
        };
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
    function get_sizes(lines, supplier_id) {
        return new Promise((resolve, reject) => {
            let sizes = [];
            lines.forEach(line => {
                const demand_page_index = line.size.details.findIndex(e => e.name === 'Demand Page');
                const demand_cell_index = line.size.details.findIndex(e => e.name === 'Demand Cell');
                let qty = 0;
                line.orders.forEach(order => {
                    if (order.status > 0) qty += order.qty;
                });
                if (
                    line.size.supplier_id === supplier_id &&
                    demand_page_index !== -1 &&
                    demand_cell_index !== -1
                ) {
                    const demand_page = line.size.details[demand_page_index].value;
                    const demand_cell = line.size.details[demand_cell_index].value;
                    if (demand_page && demand_cell) {
                        const size_index = sizes.findIndex(e => e.size_id === line.size_id);
                        if (size_index === -1) {
                            sizes.push({
                                size_id: line.size_id,
                                qty:     qty,
                                page:    demand_page,
                                cell:    demand_cell
                            });
                            
                        } else {
                            sizes[size_index].qty += qty;
                            
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

    fn.demands.file.create = function (demand_id, user) {
        return new Promise((resolve, reject) => {
            raise_demand_check(demand_id)
            .then(demand => {
                if (demand.filename && demand.filename !== '') {
                    resolve(demand.filename);

                } else {
                    create_file(demand)
                    .then(([file, filename, account]) => {
                        write_cover_sheet(file, account, filename, user, demand.demand_id)
                        .then(result => {
                            write_items(filename, demand.lines, demand.supplier_id)
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

                };
            })
            .catch(err => reject(err));
        });
    };
};