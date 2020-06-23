const op = require('sequelize').Op,
      cn = require(process.env.ROOT + '/db/constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      ex = require('exceljs'),
      pd = require('pdfkit');
module.exports = (fn, m, inc) => {
    fn.summer = items => {
        if (items == null) return 0;
        return items.reduce((a, b) => {
            return b['_qty'] == null ? a : a + b['_qty'];
        }, 0);
    };
    fn.addYears = (addYears = 0) => {
        var newDate = new Date();
        var dd = String(newDate.getDate()).padStart(2, '0');
        var MM = String(newDate.getMonth() + 1).padStart(2, '0');
        var yyyy = newDate.getFullYear() + addYears;
        return yyyy + '-' + MM + '-' + dd;
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

    fn.adjustStock = adj => new Promise((resolve, reject) => {
        if (String(_type).toLowerCase() === 'count' || String(_type).toLowerCase() === 'scrap') {
            fn.getOne(
                m.stock,
                {stock_id: adj.stock_id}
            )
            .then(stock => {
                let actions = [];
                actions.push(fn.create(m.adjusts, adj))
                if (String(_type).toLowerCase() === 'count') {
                    actions.push(
                        fn.update(
                            m.stock,
                            {_qty: adj._qty},
                            {stock_id: adj.stock_id}
                        )
                    );
                } else if (String(_type).toLowerCase() === 'scrap') {
                    actions.push(
                        fn.decrement(
                            adj.stock_id,
                            adj._qty
                        )
                    );
                };
                Promise.allSettled(actions)
                .then(results => resolve(fn.promise_results(results)))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        } else reject(new Error('Invalid adjustment type'));
    });

    fn.createRequest = request => new Promise((resolve, reject) => {
        fn.getOne(
            m.requests,
            {
                requested_for: request.requested_for,
                _complete: 0
            },
            {nullOK: true}
        )
        .then(_request => {
            if (_request) resolve({created: false, request_id: _request.request_id})
            else {
                fn.create(m.requests, request)
                .then(new_request => resolve({created: true, request_id: new_request.request_id}))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });
    fn.createRequestLine = line => new Promise((resolve, reject) => {
        fn.getOne(
            m.sizes,
            {size_id: line.size_id}
        )
        .then(size => {
            fn.getOne(
                m.requests,
                {request_id: line.request_id}
            )
            .then(request => {
                if (request._complete) reject(new Error('Lines can not be added to completed requests'))
                else {
                    fn.getOne(
                        m.request_lines,
                        {
                            request_id: request.request_id,
                            size_id: size.size_id
                        },
                        {nullOK: true}
                    )
                    .then(requestline => {
                        if (requestline) {
                            fn.increment(requestline.line_id, line._qty, 'request_lines')
                            .then(new_qty => resolve(requestline.line_id))
                            .catch(err => reject(err));
                        } else {
                            fn.create(m.request_lines, line)
                            .then(request_line => resolve(request_line.line_id))
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });

    fn.createOrder = order => new Promise((resolve, reject) => {
        fn.getOne(
            m.orders,
            {
                ordered_for: order.ordered_for,
                _complete: 0
            },
            {nullOK: true}
        )
        .then(_order => {
            if (_order) resolve({created: false, order_id: _order.order_id})
            else {
                fn.create(m.orders, order)
                .then(new_order => resolve({created: true, order_id: new_order.order_id}))
                .catch(err => reject(err));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    fn.createOrderLine = line => new Promise((resolve, reject) => {
        fn.getOne(
            m.sizes,
            {size_id: line.size_id}
        )
        .then(size => {
            if (size._orderable) {
                fn.getOne(
                    m.orders,
                    {order_id: line.order_id}
                )
                .then(order => {
                    if (order._complete) reject(new Error('Lines can not be added to completed orders'))
                    else {
                        fn.getOne(
                            m.order_lines,
                            {
                                order_id: order.order_id,
                                size_id: size.size_id
                            },
                            {nullOK: true}
                        )
                        .then(orderline => {
                            if (orderline) {
                                fn.increment(orderline.line_id, line._qty, 'order_lines')
                                .then(new_qty => resolve(orderline.line_id))
                                .catch(err => reject(err));
                            } else {
                                fn.create(m.order_lines, line)
                                .then(order_line => resolve(order_line.line_id))
                                .catch(err => reject(err));
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            } else reject(new Error('This size can not be ordered'));
        })
        .catch(err => reject(err));
    });
    
    fn.createDemand = demand => new Promise((resolve, reject) => {
        fn.getOne(
            m.suppliers,
            {supplier_id: demand.supplier_id}
        )
        .then(supplier => {
            fn.getOne(
                m.demands,
                {
                    supplier_id: supplier.supplier_id,
                    _complete: 0
                },
                {nullOK: true}
            )
            .then(_demand => {
                if (_demand) resolve({created: false, demand_id: _demand.demand_id})
                else {
                    fn.create(m.demands, demand)
                    .then(new_demand => resolve({created: true, demand_id: new_demand.demand_id}))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    fn.createDemandLine = line => new Promise((resolve, reject) => {
        fn.getOne(
            m.sizes,
            {size_id: line.size_id}
        )
        .then(size => {
            fn.getOne(
                m.demands,
                {demand_id: line.demand_id}
            )
            .then(demand => {
                if (demand._complete) reject(new Error('Lines can not be added to completed demands'))
                else if (size.supplier_id !== demand.supplier_id) reject(new Error('Size is not for this supplier'))
                else {
                    fn.getOne(
                        m.demand_lines,
                        {
                            demand_id: demand.demand_id,
                            size_id: size.size_id
                        },
                        {nullOK: true}
                    )
                    .then(demandline => {
                        if (demandline) {
                            fn.increment(demandline.line_id, line._qty, 'demand_lines')
                            .then(new_qty => resolve(demandline.line_id))
                            .catch(err => reject(err));
                        } else {
                            fn.create(m.demand_lines, line)
                            .then(demand_line => resolve(demand_line.line_id))
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });

    fn.createReceipt = receipt => new Promise((resolve, reject) => {
        fn.getOne(
            m.receipts,
            {
                supplier_id: receipt.supplier_id,
                _complete: 0
            },
            {nullOK: true}
        )
        .then(_receipt => {
            if (_receipt) resolve({created: false, receipt_id: _receipt.receipt_id})
            else {
                fn.create(m.receipts, receipt)
                .then(new_receipt => resolve({created: true, receipt_id: new_receipt.receipt_id}))
                .catch(err => reject(err));
            }
        })
        .catch(err => reject(err));
    });
    fn.createReceiptLine = line => new Promise((resolve, reject) => {
        fn.getOne(
            m.sizes,
            {size_id: line.size_id}
        )
        .then(size => {
            fn.getOne(
                m.stock,
                {stock_id: line.stock_id}
            )
            .then(stock => {
                fn.getOne(
                    m.receipts,
                    {receipt_id: line.receipt_id}
                )
                .then(receipt => {
                    if (receipt._complete) {
                        reject(new Error('Lines can not be added to completed receipts'))
                    } else if (Number(size.supplier_id) !== Number(receipt.supplier_id)) {
                        reject(new Error('Size is not for this supplier'))
                    } else if (size._serials && !line._serial) {
                        reject(new Error('You must specify a serial #'))
                    } else if (size._serials) {
                        fn.create(
                            m.serials,
                            {
                                _serial: line._serial,
                                size_id: size.size_id
                            }
                        )
                        .then(serial => {
                            line.serial_id = serial.serial_id;
                            fn.create(m.receipt_lines, line)
                            .then(receipt_line => {
                                fn.increment(receipt_line.stock_id, receipt_line._qty)
                                .then(result => resolve(receipt_line.line_id))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    } else {
                        fn.getOne(
                            m.receipt_lines,
                            {
                                receipt_id: receipt.receipt_id,
                                size_id:    size.size_id,
                                stock_id:   line.stock_id
                            },
                            {nullOK: true}
                        )
                        .then(receipt_line => {
                            if (receipt_line) {
                                fn.increment(receipt_line.line_id, line._qty, 'receipt_lines')
                                .then(new_qty => {
                                    fn.increment(receipt_line.stock_id, line._qty)
                                    .then(result => resolve(receipt_line.line_id))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            } else {
                                fn.create(m.receipt_lines, line)
                                .then(receipt_line => {
                                    fn.increment(receipt_line.stock_id, receipt_line._qty)
                                    .then(result => resolve(receipt_line.line_id))
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
            .catch(err => reject(err))
        })
        .catch(err => reject(err));
    });

    fn.createIssue = issue => new Promise((resolve, reject) => {
        fn.getOne(
            m.issues,
            {
                issued_to: issue.issued_to,
                _complete: 0
            },
            {nullOK: true}
        )
        .then(_issue => {
            if (_issue) resolve({created: false, issue_id: _issue.issue_id})
            else {
                fn.create(
                    m.issues,
                    issue
                )              
                .then(new_issue => resolve({created: true, issue_id: new_issue.issue_id}))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });
    fn.createIssueLine = line => new Promise((resolve, reject) => {
        fn.getOne(
            m.sizes,
            {size_id: line.size_id}
        )
        .then(size => {
            if (size._issueable) {
                fn.getOne(
                    m.issues,
                    {issue_id: line.issue_id}
                )
                .then(issue => {
                    if (issue._complete) {
                        reject(new Error('Lines can not be added to completed issues'));
                    } else {
                        fn.getAllWhere(
                            m.issue_lines,
                            {issue_id: issue.issue_id},
                            {nullOK: true}
                        )
                        .then(lines => {
                            if (size._serials && !line.serial_id) {
                                reject(new Error('You must specify a serial #'));
                            } else {
                                if (size._nsns && !line.nsn_id) {
                                    reject(new Error('You must specify an NSN'));
                                } else {
                                    if (!line._line) line._line = lines.length + 1;
                                    if (size._serials) {
                                        fn.getOne(
                                            m.serials,
                                            {serial_id: line.serial_id}
                                        )
                                        .then(serial => {
                                            fn.create(
                                                m.issue_lines,
                                                line
                                            )
                                            .then(issue_line => {
                                                let actions = [];
                                                actions.push(fn.decrement(issue_line.stock_id, issue_line._qty));
                                                if (line.serial_id) {
                                                    actions.push(
                                                        fn.update(
                                                            m.serials,
                                                            {issue_line_id: issue_line.line_id},
                                                            {serial_id: line.serial_id}
                                                        )
                                                    );
                                                };
                                                Promise.allSettled(actions)
                                                .then(result => {
                                                    if (fn.promise_results(result)) resolve(issue_line.line_id)
                                                    else reject(new Error('Some actions failed'));
                                                })
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    } else {
                                        fn.create(
                                            m.issue_lines,
                                            line
                                        )
                                        .then(issue_line => {
                                            fn.decrement(issue_line.stock_id, issue_line.qty)
                                            .then(result => resolve(issue_line.line_id))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    };
                                };
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            } else reject(new Error('This size can not be issued'));
        })
        .catch(err => reject(err));
    });

    fn.createReturn = _return => new Promise((resolve, reject) => {
        if (Number(_return.from) === Number(_return.user_id)) {
            reject(new Error('You cannot return items issued to yourself'));
        } else {
            fn.getOne(
                m.returns,
                {
                    from: _return.from,
                    _complete: 0,
                },
                {nullOK: true}
            )
            .then(existing_return => {
                if (existing_return) {
                    resolve({created: false, return_id: existing_return.return_id});
                } else {
                    fn.create(
                        m.returns,
                        _return
                    )              
                    .then(new_return => resolve({created: true, return_id: new_return.return_id}))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        };
    });
    fn.createReturnLine = line => new Promise((resolve, reject) => {
        fn.getOne(
            m.returns,
            {return_id: line.return_id}
        )
        .then(_return => {
            if (_return._complete) reject(new Error('Lines can not be added to completed returns'))
            else {
                fn.create(
                    m.return_lines,
                    line
                )
                .then(return_line => {
                    let actions = [];
                    actions.push(fn.increment(return_line.stock_id, return_line._qty));
                    if (line.serial_id) {
                        actions.push(
                            fn.update(
                                m.serials,
                                {issue_line_id: null},
                                {serial_id: line.serial_id}
                            )
                        );
                    };
                    Promise.allSettled(actions)
                    .then(result => {
                        if (fn.promise_results(result)) resolve(return_line.line_id)
                        else reject(new Error('Some actions failed'));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });
};