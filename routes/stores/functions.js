const op = require('sequelize').Op,
      cn = require(process.env.ROOT + '/db/constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      ex = require('exceljs'),
      pd = require('pdfkit');
var supplier_id, demand_id;
module.exports = (fn, m, inc) => {
    require(process.env.ROOT + '/functions')(fn, m, inc);
    fn.summer = items => {
        if (items == null) return 0;
        return items.reduce((a, b) => {
            return b['_qty'] == null ? a : a + b['_qty'];
        }, 0);
    };

    fn.getOptions = (options, req) => new Promise((resolve, reject) => {
        let actions = [];
        options.forEach(option => {
            actions.push(
                new Promise((resolve, reject) => {
                    fn.getAll(m[option.table], option.include || [])
                    .then(results => resolve({table: option.table, success: true, result: results}))
                    .catch(err => {
                        console.log(err);
                        reject({table: option.table, success: false, result: err});
                    });
                })
            );
        });
        Promise.allSettled(actions)
        .then(results => {
            let options = {};
            results.forEach(result => {
                if (result.value.success) options[result.value.table] = (result.value.result);
                else req.flash('info', 'No ' + result.value.table + ' found!');
            });
            resolve(options);
        })
        .catch(err => {
            console.log(err);
            resolve(null);
        })
    });

    fn.addSize = (size, details) => new Promise((resolve, reject) => {
        fn.getOne(
            m.sizes,
            {
                item_id: details.item_id,
                _size: size
            },
            {nullOK: true}
        )
        .then(itemsize => {
            if (itemsize) resolve({result: false, size: size, error: new Error('Size already exists')})
            else {
                details._size = size;
                fn.create(m.sizes, details)
                .then(itemsize => resolve({result: true, size: itemsize._size}))
                .catch(err => reject({result: false, size: size, error: err}));
            };
        })
        .catch(err => reject({ result: true, err: err }));
    });

    fn.getNotes = (table, id, req) => new Promise(resolve => {
        let whereObj = {_table: table, _id: id}, 
            system = Number(req.query.system) || 2;
        if (system === 2) whereObj._system = false
        else if (system === 3)  whereObj._system = true;
        fn.getAllWhere(m.notes, whereObj, {nullOk: true})
        .then(notes => resolve(notes))
        .catch(err => {
            req.flash('danger', 'Error searching notes');
            console.log(err);
            resolve(null);
        });
    });

    fn.closeRequest = (request_id, user_id) => new Promise((resolve, reject) => {
        closeIfNoLines({
            table: 'requests', 
            table_lines: 'request_lines', 
            id: request_id, 
            where_id: {request_id: request_id}, 
            where_status: {_status: 'Pending'}, 
            user_id: user_id
        })
        .then(close_result => resolve(close_result.closed))
        .catch(err => reject(err))
    });
    fn.closeOrder = (order_id, user_id) => new Promise((resolve, reject) => {
        closeIfNoLines({
            table: 'orders', 
            table_lines: 'order_lines', 
            id: order_id, 
            where_id: {order_id: order_id}, 
            where_status: {_status: 'Open'}, 
            user_id: user_id
        })
        .then(close_result => resolve(close_result.closed))
        .catch(err => reject(err))
    });
    function closeDemand (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            closeIfNoLines({
                table: 'demands', 
                table_lines: 'demand_lines', 
                id: demand_id, 
                where_id: {demand_id: demand_id}, 
                where_status: {_status: 'Pending'}, 
                user_id: user_id
            })
            .then(close_result => resolve(close_result.closed))
            .catch(err => reject(err))
        });
    };
    fn.closeIssue = (issue_id, user_id) => new Promise((resolve, reject) => {
        closeIfNoLines({
            table: 'issues', 
            table_lines: 'issue_lines', 
            id: issue_id, 
            where_id: {issue_id: issue_id}, 
            where_status: {return_line_id: null}, 
            user_id: user_id
        })
        .then(close_result => resolve(close_result.closed))
        .catch(err => reject(err))
    });
    function closeIfNoLines (options = null) { 
        return new Promise((resolve, reject) => {
            if (options.table && options.table_lines && options.id && options.where_id && options.where_status && options.user_id) {
                fn.getAllWhere(
                    m[options.table_lines],
                    options.where_status,
                    {
                        include: [inc[options.table]({
                            where: options.where_id,
                            required: true
                        })],
                        nullOK: true
                    }
                )
                .then(lines => {
                    if (lines.length > 0) {
                        resolve({closed: false, error: new Error('Open lines')});
                    } else {
                        let updates = [];
                        updates.push(
                            fn.update(
                                m[options.table],
                                {_complete: 1},
                                options.where_id
                            )
                        )
                        updates.push(
                            fn.create(
                                m.notes,
                                new cn.Note(
                                    options.table,
                                    options.id,
                                    fn.singularise(options.table, true) + ' closed',
                                    true,
                                    options.user_id
                                )
                            )
                        )
                        Promise.allSettled(updates)
                        .then(results => {
                            resolve({closed: true})
                        })
                        .catch(err => {
                            reject({closed: false, error: err})
                        });
                    };
                })
                .catch(err => {
                    reject({closed: false, error: err})
                });
            } else reject({closed: false, error: new Error('Missing options')});
        });
    };

    fn.demand_order_lines = (selected, user_id)  => new Promise((resolve, reject) => {
        let actions = [];
        selected.forEach(line_id => {
            actions.push(
                fn.getOne(
                    m.order_lines,
                    {line_id: line_id},
                    {include: [
                        inc.sizes({include: [
                            inc.suppliers({include: [
                                m.files, 
                                {model: m.accounts, include: [inc.users()]}
                            ]})
                        ]}),
                        inc.orders({include: [
                            inc.users({as: '_for'})
                        ]})
                    ]}
                )
            );
        });
        Promise.allSettled(actions)
        .then(order_lines => {
            let suppliers = {};
            order_lines.forEach(order_line => {
                let line = order_line.value;
                if (!line.demand_line_id) {
                    let supplier_id = String(line.size.supplier_id);
                    if (suppliers[supplier_id]) {
                        let _index = suppliers[supplier_id].lines.findIndex(e => e.size_id === line.size_id);
                        if (_index === -1) {
                            suppliers[supplier_id].lines.push({
                                size_id:     line.size_id,
                                qty:         line._qty,
                                order_lines: [line.line_id]
                            })
                        } else {
                            suppliers[supplier_id].lines[_index].qty += Number(line._qty);
                            suppliers[supplier_id].lines[_index].order_lines.push(line.line_id);
                        };

                    } else {
                        suppliers[supplier_id] = {};
                        suppliers[supplier_id].supplier = line.size.supplier;
                        suppliers[supplier_id].lines = [{
                            size_id:     line.size_id,
                            qty:         line._qty,
                            order_lines: [line.line_id]
                        }]
                    };
                };
            });
            if (Object.entries(suppliers).length > 0) {
                let demands = [];
                for (let [supplier_id, supplier] of Object.entries(suppliers)) {
                    if (supplier.supplier._raise_demand) {
                        if (supplier.supplier.file) {
                            demands.push(
                                fn.raiseDemand(
                                    order_lines,
                                    supplier,
                                    user_id
                                )
                            );
                        } else {
                            fn.update(
                                m.suppliers,
                                {_raise_demand: 0},
                                {supplier_id: supplier_id}
                            )
                            reject(new Error(supplier.supplier._name + ': Raise demand flag is set, but there is no associated file. The raise demand flag has been removed'))
                        };
                    } else {
                        demands.push(
                            fn.createDemand(
                                supplier_id,
                                supplier.lines,
                                user_id
                            )
                        );
                    };
                };
                Promise.allSettled(demands)
                .then(results => resolve(results))
                .catch(err => reject(err));
            } else {
                reject(new Error('No lines that can be demanded'))
            };
        })
        .catch(err => reject(err));
    });
    fn.receive_order_lines = selected  => new Promise((resolve, reject) => {
        let actions = [];
        selected.forEach(line_id => {
            actions.push(
                fn.getOne(
                    m.order_lines,
                    {
                        line_id: line_id,
                        demand_line_id: {[op.not]: null},
                        receipt_line_id: null
                    },
                    {
                        include: [
                            inc.sizes({
                                stock: true})
                        ],
                        nullOK: true
                    }
                )
            );
        });
        Promise.allSettled(actions)
        .then(order_lines => {
            let items = [], supplier_id = -1;
            order_lines.forEach(order_line => {
                if (order_line.value) {
                    let line = order_line.value;
                    if (supplier_id === -1) supplier_id = Number(line.size.supplier_id)
                    else if (supplier_id !== Number(line.size.supplier_id)) reject(new Error('Selected lines contain items from different suppliers'));
                    let _index = items.findIndex(e => e.size_id === Number(line.size_id));
                    if (_index === -1) {
                        let stocks = [];
                        line.size.stocks.forEach(stock => {
                            stocks.push({
                                stock_id:  stock.stock_id,
                                _location: stock.location._location,
                                qty:       stock._qty
                            });
                        });
                        items.push({
                            size_id:     Number(line.size_id),
                            description: line.size.item._description,
                            size:        line.size._size,
                            stocks:      stocks,
                            qty:         line._qty,
                            order_lines: [line.line_id]
                        });
                    } else {
                        items[_index].qty += Number(line._qty);
                        items[_index].order_lines.push(line.line_id);
                    };
                };
            });
            fn.getOne(
                m.suppliers,
                {supplier_id: supplier_id}
            )
            .then(supplier => resolve({items: items, supplier: supplier}))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    fn.issue_order_lines = selected  => new Promise((resolve, reject) => {
        let actions = [];
        selected.forEach(line_id => {
            actions.push(
                fn.getOne(
                    m.order_lines,
                    {
                        line_id: line_id,
                        receipt_line_id: {[op.not]: null},
                        issue_line_id: null
                    },
                    {
                        include: [
                            inc.orders(),
                            inc.sizes({
                                stock: true,
                                nsns: true,
                                serials: true})
                        ],
                        nullOK: true
                    }
                )
            );
        });
        Promise.allSettled(actions)
        .then(orders => {
            let items = [], user_id = -1;
            orders.forEach(order_line => {
                if (order_line.value) {
                    let line = order_line.value;
                    if (user_id === -1) user_id = Number(line.order.ordered_for)
                    else if (user_id !== Number(line.order.ordered_for)) reject(new Error('Selected lines contain items for different users'));
                    let _index = items.findIndex(e => e.size_id === Number(line.size_id));
                    if (_index === -1) {
                        let stocks = [];
                        line.size.stocks.forEach(stock => {
                            stocks.push({
                                stock_id:  stock.stock_id,
                                _location: stock.location._location,
                                qty:       stock._qty
                            });
                        });
                        items.push({
                            size_id:     Number(line.size_id),
                            description: line.size.item._description,
                            size:        line.size._size,
                            stocks:      stocks,
                            nsns:        line.size.nsns,
                            serials:     line.size.serials,
                            qty:         line._qty,
                            order_lines: [line.line_id]
                        });
                    } else {
                        items[_index].qty += Number(line._qty);
                        items[_index].order_lines.push(line.line_id);
                    };
                }
            });
            fn.getOne(
                m.users,
                {user_id: user_id},
                {include: [m.ranks]}
            )
            .then(user => resolve({items: items, user: user}))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    fn.cancel_order_lines = (selected, order_id, user_id)  => new Promise((resolve, reject) => {
        let actions = [];
        selected.forEach(line_id => {
            actions.push(
                fn.update(
                    m.order_lines,
                    {_status: 'Cancelled'},
                    {line_id: line_id}
                )
            )
        });
        Promise.allSettled(actions)
        .then(cancel_result => {
            if (cancel_result.filter(e => e.value === [0]).length === 0) {
                fn.closeOrder(
                    order_id, user_id
                )
                .then(close_result => {
                    resolve(close_result.closed);
                })
                .catch(err => reject(err))
            } else {
                reject(new Error('Some lines failed'));
            };
        })
        .catch(err => reject(err));
    });
    fn.receive_demand_lines = selected  => new Promise((resolve, reject) => {
        let actions = [];
        selected.forEach(line_id => {
            actions.push(
                fn.getOne(
                    m.demand_lines,
                    {
                        line_id: line_id,
                        _status: 'Pending'
                    },
                    {
                        include: [
                            inc.sizes({
                                stock: true}),
                            inc.order_lines({as: 'order_lines'})
                        ],
                        nullOK: true
                    }
                )
            );
        });
        Promise.allSettled(actions)
        .then(demand_lines => {
            let items = [], supplier_id = -1, noStocks = false;
            demand_lines.forEach(demand_line => {
                if (demand_line.value) {
                    let line = demand_line.value;
                    if (line.size.stocks && line.size.stocks.length > 0) {
                        if (supplier_id === -1) supplier_id = Number(line.size.supplier_id)
                        else if (supplier_id !== Number(line.size.supplier_id)) reject(new Error('Selected lines contain items from different suppliers'));
                        let stocks = [];
                        line.size.stocks.forEach(stock => {
                            stocks.push({
                                stock_id:  stock.stock_id,
                                _location: stock.location._location,
                                qty:       stock._qty
                            });
                        });
                        let order_lines = [];
                        line.order_lines.forEach(order_line => {
                            order_lines.push(order_line.line_id);
                        })
                        items.push({
                            size_id:        Number(line.size_id),
                            description:    line.size.item._description,
                            size:           line.size._size,
                            stocks:         stocks,
                            qty:            line._qty,
                            demand_line_id: line.line_id,
                            order_lines:    order_lines
                        });
                    } else noStocks = true;
                };
            });
            fn.getOne(
                m.suppliers,
                {supplier_id: supplier_id}
            )
            .then(supplier => resolve({items: items, noStocks: noStocks, supplier: supplier}))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    fn.cancel_demand_lines = (selected, demand_id, user_id) => new Promise((resolve, reject) => {
        let actions = [];
        selected.forEach(line_id => {
            actions.push(
                fn.update(
                    m.demand_lines,
                    {_status: 'Cancelled'},
                    {line_id: line_id}
                )
            );
            actions.push(
                fn.update(
                    m.order_lines,
                    {demand_line_id: null},
                    {demand_line_id: line_id}
                )
            );
        });
        Promise.allSettled(actions)
        .then(results => {
            closeDemand(demand_id, user_id)
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });

    fn.raiseDemand = (order_list, supplier, user_id) => new Promise((resolve, reject) => {
        let orders = [], rejects = false, users = [];
        order_list.forEach(order => {
            if (String(order.size._demand_page) === '' || String(order.size._demand_cell) === '') rejects = true;
            else {
                let existing = orders.findIndex(e => e.size_id === order.size_id);
                if (existing === -1) 
                    orders.push({
                        line_ids: [order.line_id],
                        size_id: order.size_id,
                        page: order.size._demand_page,
                        cell: order.size._demand_cell,
                        qty: order._qty
                    });
                else {
                    orders[existing].qty += order._qty;
                    orders[existing].lines.push(order.line_id);
                };
                if (order.order.ordered_for !== -1 && !users.some(e => e.bader === order.order._for._bader)) {
                    let user = {
                        rank: order.order._for.rank._rank,
                        name: order.order._for._name,
                        bader: order.order._for._bader
                    };
                    users.push(user);
                };
            };
        });
        createDemandFile(supplier)
        .then(file => {
            writeItems(file, orders)
            .then(results1 => {
                if (results1.fails.length > 0) rejects = true;
                if (results1.success.length > 0)
                    writeCoverSheet(
                        file,
                        supplier,
                        users
                    )
                    .then(results2 => {
                        fn.createDemand(
                            supplier_id,
                            results1.success,
                            user_id,
                            results.file
                        )
                        .then(demand_id => resolve({demand_id: demand_id, file: file, rejects: rejects}))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                else reject(new Error('No items written to demand'));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    function createDemandFile (supplier) {
        return new Promise((resolve, reject) => {
            if (supplier.file._path) {
                let path = process.env.ROOT + '/public/res/',
                    newDemand = 'demands/' + fn.timestamp() + ' demand - ' + supplier._name + '.xlsx',
                    demandFile = path + 'files/' + supplier.file._path;
                fs.copyFile(demandFile, path + newDemand, err => {
                    if (!err) resolve(newDemand)
                    else reject(err);
                });
            } else reject(new Error('No demand file specified'));
        });
    };
    function writeItems (file, orders) {
        return new Promise((resolve, reject) => {
            let workbook = new ex.Workbook(),
                path = process.env.ROOT + '/public/res/';
            workbook.xlsx.readFile(path + file)
            .then(() => {
                let success = [],
                    fails = [];
                orders.forEach(order => {
                    try {
                        let worksheet = workbook.getWorksheet(order.page),
                            cell = worksheet.getCell(order.cell);
                        cell.value = order.qty;
                        success.push({
                            lines: order.line_ids,
                            size_id: order.size_id,
                            qty: order.qty
                        });
                    } catch (err) {
                        fails.push({
                            lines: order.line_ids,
                            reason: err.message
                        });
                    };
                });
                workbook.xlsx.writeFile(path + file)
                .then(() => resolve({success: success, fails: fails}))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function writeCoverSheet (file, supplier, users) {
        return new Promise((resolve, reject) => {
            let workbook = new ex.Workbook(),
                path = process.env.ROOT + '/public/res/';
            workbook.xlsx.readFile(path + file)
            .then(() => {
                try {
                    let worksheet = workbook.getWorksheet(supplier.file._cover_sheet);

                    let cell_code = worksheet.getCell(supplier.file['_code']);
                    cell_code.value = supplier.account._number;

                    let cell_rank = worksheet.getCell(supplier.file['_rank']);
                    cell_rank.value = supplier.account.user.rank._rank;

                    let cell_name = worksheet.getCell(supplier.file['_name']);
                    cell_name.value = supplier.account.user._name;

                    let cell_sqn = worksheet.getCell(supplier.file['_sqn']);
                    cell_sqn.value = supplier.account._name;

                    let cell = worksheet.getCell(supplier.file._date),
                        now = new Date(),
                        line = fn.counter();

                    for (let r = Number(supplier.file._request_start); r <= Number(supplier.file._request_end); r++) {
                        let rankCell = worksheet.getCell(supplier.file._rank_column + r),
                            nameCell = worksheet.getCell(supplier.file._name_column + r),
                            currentLine = line() - 1,
                            sortedKeys = Object.keys(users).sort(),
                            user = users[sortedKeys[currentLine]];
                        if (user) {
                            rankCell.value = user.rank;
                            nameCell.value = user.name + ' (' + user.bader + ')';
                        } else break;
                    };
                    cell.value = now.toDateString();
                    workbook.xlsx.writeFile(path + file)
                    .then(() => resolve(true))
                    .catch(err => reject(err));
                } catch (err) {
                    reject(err);
                }
            }).catch(err => reject(err));
        });
    };

    fn.createLoanCard = issue_id => new Promise((resolve, reject) => {
        fn.getOne(
            m.issues,
            {issue_id: issue_id},
            {include: [
                inc.users({as: '_to'}),
                inc.users({as: '_by'}),
                inc.issue_lines({include: [
                    inc.nsns(),
                    inc.serials(),
                    inc.stock({size: true})
                ]})
            ]}
        )
        .then(issue => {
            try {
                let path = process.env.ROOT + '/public/res/',
                    docMetadata = {},
                    file = 'loancards/Issue ' + issue.issue_id + ' - ' + issue._to._name + '.pdf',
                    writeStream = fs.createWriteStream(path + file);
                docMetadata.Title = 'Loan Card - Issue: ' + issue.issue_id;
                docMetadata.Author = issue._by.rank._rank + ' ' + issue._by._name + ', ' + issue._by._ini;
                docMetadata.autoFirstPage = false;
                docMetadata.bufferPages = true;
                const doc = new pd(docMetadata);
                doc.pipe(writeStream);
                doc.font(process.env.ROOT + '/public/lib/fonts/myriad-pro/d (1).woff');
                addPage(doc);
                drawHeader(doc, issue);
                doc
                    .fontSize(10)
                    .text('NSN', 28, 225)
                    .text('Description', 123.81, 225)
                    .text('Size', 276.31, 225)
                    .text('Qty', 373.56, 225)
                    .text('Return Date', 404.21, 225)
                    .text('Signature', 499.745, 225)
                    .moveTo(28, 245).lineTo(567.28, 245).stroke();
                drawIssues(doc, issue);
                addPageNumbers(doc, issue.issue_id);
                doc.end();
                writeStream.on('finish', () => {
                    fn.update(
                        m.issues,
                        { _filename: file },
                        { issue_id: issue_id}
                    )
                    .then(result => resolve(file))
                    .catch(err => reject(err));
                });
            } catch (err) {
                reject(err)
            };
        })
        .catch(err => reject(err));
    });
    function addPage (doc) {
        let pageMetaData = {};
        pageMetaData.size    = 'A4';
        pageMetaData.margins = 28;
        doc.addPage(pageMetaData);    
    };
    function drawHeader (doc, issue) {
        try {
            doc
            .image(process.env.ROOT + '/public/img/rafac_logo.png', 28, 48, {fit: [112, 168]})
            .image(process.env.ROOT + '/public/img/sqnCrest.png', 470.25, 48, {height: 100})
            .fontSize(30)
            .text('1801 SQUADRON ATC', 154.12, 48, {align: 'justify'})
            .text('STORES LOAN CARD', 163.89, 98, {align: 'justify'})
            .moveTo(28, 170).lineTo(567.28, 170).stroke()
            .fontSize(15)
            .text('Rank: ' + issue._to.rank._rank, 28, 175)
            .text('Surname: ' + issue._to._name, 140, 175)
            .text('Initials: ' + issue._to._ini, 415, 175)
            .text('Bader/Service #: ' + issue._to._bader, 28, 195)
            .text('Date: ' + issue._date.toDateString(), 415, 195)
            .moveTo(28, 220).lineTo(567.28, 220).stroke();
        } catch(err) {
            console.log(err);
        };
    };
    function drawIssues (doc, issue) {
        try {
            let y = 250;
            issue.lines.forEach(line => {
                if (y >= 761.89) {
                    doc
                    .text('END OF PAGE', 268, y)
                    .addPage();
                    drawHeader(doc, issue);
                };
                let nsn = '', description = '', size = '';
                if (line.nsn || line.serial) {
                    if (line.nsn) nsn += line.nsn._nsn + ' ';
                    if (line.serial) nsn += line.serial._serial
                };
                if (line.stock && line.stock.size) size = line.stock.size._size;
                if (line.stock && line.stock.size && line.stock.size.item) description = line.stock.size.item._description;
                doc.text(nsn,         28,     y, {width: 90,  align: 'left'});
                doc.text(description, 123.81, y, {width: 147, align: 'left'});
                doc.text(size,        276.31, y, {width: 92,  align: 'left'});
                doc.text(line._qty,   373.56, y);
                if (doc.widthOfString(nsn) > 90 || doc.widthOfString(description) > 147 || doc.widthOfString(size) > 92) y += 10;
                y += 15;
                doc.moveTo(28, y).lineTo(567.28, y).stroke();
            });
            let close_text = 'END OF ISSUE, ' + issue.lines.length + ' LINES ISSUED';
            doc
            .text(close_text, 297.64 - (doc.widthOfString(close_text) / 2), y)
            .moveTo(116.81, 220).lineTo(116.81, y).stroke()
            .moveTo(269.31, 220).lineTo(269.31, y).stroke()
            .moveTo(366.56, 220).lineTo(366.56, y).stroke()
            .moveTo(397.21, 220).lineTo(397.21, y).stroke()
            .moveTo(116.81, 220).lineTo(116.81, y).stroke()
            .moveTo(492.745, 220).lineTo(492.745, y).stroke();
            y += 20;
            let disclaimer = 'By signing below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
            doc
            .text(disclaimer, 28, y, {width: 539.28, align: 'center'})
            .rect(197.64, y += 60, 200, 100).stroke();
        } catch(err) {
            console.log(err);
        };
    };
    function addPageNumbers (doc, issue_id) {
        const range = doc.bufferedPageRange();
        doc.fontSize(15);
        for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
            doc.switchToPage(i);
            doc
            .text(`Page ${i + 1} of ${range.count}`, 28, 803.89)
            .text('Issue ID: ' + issue_id, (567.28 - doc.widthOfString('Issue ID: ' + issue_id)), 803.89)
            .text(`Page ${i + 1} of ${range.count}`, 28, 28)
            .text('Issue ID: ' + issue_id, (567.28 - doc.widthOfString('Issue ID: ' + issue_id)), 28);
        }
    };

    fn.adjustStock = (_type, stock_id, qty, user_id) => new Promise((resolve, reject) => {
        if (String(_type).toLowerCase() === 'count' || String(_type).toLowerCase() === 'scrap') {
            fn.getOne(
                m.stock,
                {stock_id: stock_id}
            )
            .then(stock => {
                fn.create(
                    m.adjusts,
                    new cn.Adjustment(stock_id, _type, qty, stock._qty, user_id)
                )
                .then(newAdjust => {
                    if (String(_type).toLowerCase() === 'count') {
                        fn.update(
                            m.stock,
                            {_qty: qty},
                            {stock_id: stock_id}
                        )
                        .then(result => resolve(newAdjust.adjust_id))
                        .catch(err => reject(err));
                    } else {
                        fn.subtractStock(
                            stock_id,
                            qty
                        )
                        .then(result => resolve(newAdjust.adjust_id))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        } else reject(new Error('Invalid adjustment type'));
    });

    fn.createRequest = (requestFor, lines, user_id) => new Promise((resolve, reject) => {
        let newRequest = new cn.Request(user_id, requestFor);
        fn.create(m.requests, newRequest)
        .then(request => {
            let actions = [];
            for (let [size_id, line] of Object.entries(lines)) {
                actions.push(
                    fn.create(
                        m.request_lines,
                        new cn.RequestLine(request.request_id, size_id, line.qty)
                    )
                );
            };
            if (actions.length > 0) {
                Promise.allSettled(actions)
                .then(results => resolve(request.request_id))
                .catch(err => reject(err));
            } else {
                fn.delete('requests', {request_id: request.request_id})
                .then(next => reject(new Error('No lines, request deleted')))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });

    fn.createOrder = (orderFor, lines, user_id, orderNote = null) => new Promise((resolve, reject) => {
        let newOrder = new cn.Order(orderFor, user_id),
            order_line = fn.counter(),
            actions = [];
        fn.create(m.orders, newOrder)
        .then(order => {
            if (orderNote) {
                actions.push(
                    fn.create(
                        m.notes,
                        new cn.Note(
                            'orders',
                            order.order_id,
                            orderNote._text,
                            orderNote._system,
                            user_id
                        )
                    )
                );
            };
            for (let [size_id, line] of Object.entries(lines)) {
                actions.push(
                    createOrderLine(
                        order.order_id,
                        line.size_id,
                        line,
                        user_id
                    )
                );
                order_line();
            };
            if (order_line() === 1) {
                fn.delete('orders', {order_id: order.order_id})
                .then(result => reject(new Error('No order lines')))
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
            } else {
                Promise.allSettled(actions)
                .then(results => resolve(order.order_id))
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
            };
        })
        .catch(err => {
            console.log(err);
            reject(err);
        });
    });
    function createOrderLine (order_id, size_id, line, user_id) {
        return new Promise((resolve, reject) => {
            fn.create(
                m.order_lines,
                new cn.OrderLine(order_id, size_id, line.qty)
            )
            .then(order_lines => {
                if (line.request_line_id) {
                    updateRequestStatus(
                        line.request_line_id,
                        { _status: 'Approved', _action: 'Order', _id: order_id},
                        user_id
                    )
                    .then(result => {
                        resolve(order_lines.line_id);
                    })
                    .catch(err => reject(err));
                } else {
                    resolve(order_lines.line_id);
                };
            })
            .catch(err => reject(err));
        });
    };
    
    fn.createDemand = (supplier_id, lines, user_id, file = null) => new Promise((resolve, reject) => {
        let newDemand = new cn.Demand(supplier_id, user_id);
        if (file) newDemand._filename = file;
        fn.create(
            m.demands,
            newDemand
        )
        .then(demand => {
            let demandLines = [];
            lines.forEach(line => demandLines.push(createDemandLine(demand.demand_id, line)));
            if (demandLines.length > 0) {
                Promise.allSettled(demandLines)
                .then(results => resolve({demand_id: demand.demand_id}))
                .catch(err => reject(err));
            } else reject(new Error('No demanded lines'));
        })
        .catch(err => reject(err));
    });
    function createDemandLine (demand_id, line) {
        return new Promise((resolve, reject) => {
            fn.create(
                m.demand_lines,
                new cn.DemandLine(demand_id, line.size_id, line.qty)
            )
            .then(demand_line => {
                if (line.order_lines) {
                    let order_updates = [];
                    line.order_lines.forEach(line_id => {
                        order_updates.push(
                            fn.update(
                                m.order_lines,
                                {demand_line_id: demand_line.line_id},
                                {line_id: line_id}
                            )
                        );
                    });
                    if (order_updates.length > 0) {
                        Promise.allSettled(order_updates)
                        .then(results => resolve(results))
                        .catch(err => reject(err));
                    } else reject(new Error('No line IDs'));
                } else resolve(demand_line.line_id);
            })
            .catch(err => reject(err));
        });
    };

    fn.createReceipt = (supplier_id, lines, user_id) => new Promise((resolve, reject) => {
        let newReceipt = new cn.Receipt(supplier_id, user_id);
        fn.create(
            m.receipts,
            newReceipt
        )
        .then(receipt => {
            let actions = [];
            for (let [key, line] of Object.entries(lines)) {
                actions.push(createReceiptLine(receipt.receipt_id, line));
                actions.push(fn.addStock(line.stock_id, line.qty));
            };            
            if (actions.length > 0) {
                Promise.allSettled(actions)
                    .then(results => resolve(receipt.receipt_id))
                    .catch(err => reject(err));
            } else {
                fn.delete('receipts', {receipt_id: receipt.receipt_id})
                .then(result => reject(new Error('No lines, receipt deleted')))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });
    function createReceiptLine (receipt_id, line) { 
        return new Promise((resolve, reject) => {
            let newLine = new cn.ReceiptLine(line.stock_id, line.qty, receipt_id);
            fn.create(
                m.receipt_lines,
                newLine
            )
            .then(receipt_line => {
                let actions = [];
                if (line.demand_line_id) {
                    actions.push(
                        fn.update(
                            m.demand_lines,
                            {_status: 'Received'},
                            {line_id: line.demand_line}
                        )
                    )
                };
                if (line.order_lines) {
                    line.order_lines.forEach(line_id => {
                        actions.push(
                            fn.update(
                                m.order_lines,
                                {receipt_line_id: receipt_line.line_id},
                                {line_id: line_id}
                            )
                        );
                    });
                };
                if (actions.length > 0) {
                    Promise.allSettled(actions)
                    .then(results => resolve(receipt_line.line_id))
                    .catch(err => reject(err));
                } else resolve(receipt_line.line_id);
            })
            .catch(err => reject(err));
        });
    };

    fn.createIssue = (issueDetails, lines, user_id, issueNote = null) => new Promise((resolve, reject) => {
        if (Object.keys(lines).length > 0) {
            fn.create(
                m.issues,
                new cn.Issue(issueDetails, user_id)
            )
            .then(issue => {
                let actions = [];
                if (issueNote) actions.push(fn.create(m.notes, new cn.Note('issues', issue.issue_id, issueNote._text, issueNote._system, user_id)));
                let currentLine = fn.counter();
                for (let [item_id, line] of Object.entries(lines)) {
                    if (line) {
                        actions.push(createIssueLine(issue.issue_id, line, user_id, currentLine()))
                    };
                };
                Promise.allSettled(actions)
                .then(results => {
                    if (currentLine() === 1) {
                        fn.delete('issues', {issue_id: issue.issue_id})
                        .then(result => reject(new Error('No lines on issue, issue deleted')))
                        .catch(err => reject(err));
                    } else {
                        fn.createLoanCard(issue.issue_id)
                        .then(file => resolve(issue.issue_id))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        } else reject(new Error('No items selected'));
    });
    function createIssueLine (issue_id, line, user_id, lineNum) {
        return new Promise((resolve, reject) => {
            fn.create(
                m.issue_lines,
                new cn.IssueLine(issue_id, line, lineNum)
            )
            .then(issue_line => {
                let actions = [];
                actions.push(fn.subtractStock(issue_line.stock_id, issue_line.qty));
                if (line.serial_id) {
                    actions.push(
                        fn.update(
                            m.serials,
                            {issue_line_id: issue_line.line_id},
                            {serial_id: line.serial_id}
                        )
                    );
                };
                if (line.request_line_id) {
                    actions.push(
                        updateRequestStatus(
                            line.request_line_id,
                            { _status: 'Approved', _action: 'Issue', _id: issue_id },
                            user_id
                        )
                    );
                };
                if (line.order_lines) {
                    line.order_lines.forEach(order_line_id => {
                        actions.push(
                            fn.update(
                                m.order_lines,
                                {issue_line_id: issue_line.line_id},
                                {line_id: order_line_id}
                            )
                        );
                    });
                };
                if (actions.length > 0) {
                    Promise.allSettled(actions)
                    .then(result => resolve(issue_line.line_id))
                    .catch(err => reject(err));
                } else resolve(issue_line.line_id);
                
            })
            .catch(err => reject(err));
        });
    };

    fn.createReturn = (from, lines, user_id) => new Promise((resolve, reject) => {
        if (Number(from) !== Number(user_id)) {
            let newReturn = new cn.Return(from, user_id),
                return_line = fn.counter(),
                actions = [],
                issueIDs = [],
                stockToReturn = [];
            fn.create(
                m.returns,
                newReturn
            )
            .then(_return => {
                lines.forEach(line => {
                    line = JSON.parse(line);
                    let existing = stockToReturn.findIndex(e => e.stock_id === line.stock_id);
                    if (existing === -1) {
                        stockToReturn.push({
                            stock_id: line.stock_id,
                            qty: line.qty
                        });
                    } else stockToReturn[existing].qty += line.qty;
                    actions.push(createReturnLine(_return.return_id, line));
                    if (!issueIDs.includes(line.issue_id)) issueIDs.push(line.issue_id);
                    return_line();
                });
                if (stockToReturn.length > 0) {
                    stockToReturn.forEach(stock => {
                        actions.push(fn.addStock(stock.stock_id, stock.qty));
                    });
                };
                if (return_line() === 1) {
                    fn.delete('returns', {return_id: _return.return_id})
                    .then(result => reject(new Error('No return lines')))
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });
                } else {
                    Promise.allSettled(actions)
                    .then(results => {
                        let checks = [];
                        issueIDs.forEach(issue_id => {
                            checks.push(closeIssue(issue_id, user_id));
                        });
                        Promise.allSettled(checks)
                        .then(results => resolve(_return.return_id))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        } else reject(new Error('You cannot return items issued to yourself'));
    });
    function createReturnLine (return_id, line) { 
        return new Promise((resolve, reject) => {
            let newLine = new cn.ReturnLine(return_id, line);
            fn.create(
                m.return_lines,
                newLine
            )
            .then(return_line => {
                let updateIssue = { return_line_id: return_line.line_id };
                let actions = [];
                actions.push(fn.update(m.issue_lines, updateIssue, { line_id: line.line_id }))
                fn.getOne(
                    m.issue_lines,
                    {line_id: line.line_id}
                )
                .then(issue => {
                    if (issue.serial_id) actions.push(fn.update(m.serials, {issue_line_id: -1}, {serial_id: issue.serial_id}))
                    Promise.allSettled(actions)
                    .then(result => resolve(result))
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });
                })
                .catch(err => reject(err));
                
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        
        });
    };
};