module.exports = function (m, fn) {
    fn.loancards = {lines: {}};
    //string height @ 30: 38.19
    //string height @ 15: 19.095
    //string height @ 10: 12.7299999
    // A4 (595.28 x 841.89)
    function createFile(loancard) {
        return new Promise((resolve, reject) => {
            try {
                const fs  = require('fs'),
                      PDF = require('pdfkit');
                try {
                    let file        = `${loancard.loancard_id}-${loancard.user_loancard.surname}.pdf`,
                        docMetadata = {},
                        writeStream = fs.createWriteStream(`${process.env.ROOT}/public/res/loancards/${file}`, {flags: 'w'});
                    docMetadata.Title         = `Loan Card: ${loancard.loancard_id}`;
                    docMetadata.Author        = `${loancard.user.rank.rank} ${loancard.user.full_name}`;
                    docMetadata.bufferPages   = true;
                    docMetadata.autoFirstPage = false;
                    const doc = new PDF(docMetadata);
                    doc.pipe(writeStream);
                    doc.font(`${process.env.ROOT}/public/lib/fonts/myriad-pro/d (1).woff`);
                    resolve([doc, file, writeStream]);
                } catch (err) {
                    console.log(err);
                    reject(err);
                };
            } catch (err) {
                reject(err);
            };
        });
    };
    function addPage(doc) {
        let pageMetaData = {};
        pageMetaData.size    = 'A4';
        pageMetaData.margins = 28;
        doc.addPage(pageMetaData);
        return 28;
    };
    function addLogos(doc, y) {
        doc
            .image(`${process.env.ROOT}/public/img/rafac_logo.png`, 28,  y, {height: 80})
            .image(`${process.env.ROOT}/public/img/sqnCrest.png`,   470, y, {height: 80})
            .fontSize(30)
            .text('1801 SQUADRON ATC', 28, y,    {width: 539, align: 'center'})
            .text('STORES LOAN CARD',  28, y+40, {width: 539, align: 'center'});
        return 85;
    };
    function addHeader(doc, loancard, y) {
        doc
            .fontSize(15)
            .text(`Rank: ${      loancard.user_loancard.rank.rank}`,      28,  y)
            .text(`Surname: ${   loancard.user_loancard.surname}`,        140, y)
            .text(`First Name: ${loancard.user_loancard.first_name}`,     380, y)
            .text(`Service #: ${ loancard.user_loancard.service_number}`, 28,  y+20)
            .text(`Date: ${new Date(loancard.createdAt).toDateString()}`, 415, y+20)
            .fontSize(10)
            .text('Item',        161, y+40)
            .text('Qty',         320, y+40)
            .text('Return Date', 368, y+40)
            .text('Signature',   484, y+40)
            //Horizontal Lines
            .moveTo( 28, y)   .lineTo(567, y)   .stroke()
            .moveTo( 28, y+40).lineTo(567, y+40).stroke()
            .moveTo( 28, y+55).lineTo(567, y+55).stroke()
            //Vertical Lines
            .moveTo(315, y+40).lineTo(315, y+55).stroke()
            .moveTo(345, y+40).lineTo(345, y+55).stroke()
            .moveTo(445, y+40).lineTo(445, y+55).stroke();
        return 55;
    };
    function addDeclaration(doc, count, y) {
        if (y >= 640) {
            doc.text('END OF PAGE', 28, y, {width: 539, align: 'center'});
            y = addPage(doc);
        };
        let close_text = `END OF LOANCARD, ${count} LINE(S) ISSUED`,
            disclaimer = 'By signing in the box below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
        doc
            .text(close_text, 28, y,    {width: 539, align: 'center'})
            .text(disclaimer, 28, y+20, {width: 539, align: 'center'})
            .rect(197.64, y+50, 200, 100).stroke();
    };
    function addPageNumbers(doc, loancard_id) {
        const range = doc.bufferedPageRange();
        doc.fontSize(10);
        for (let i = range.start; i < range.count; i++) {
            doc.switchToPage(i);
            doc
            .text(`Page ${i + 1} of ${range.count}`, 28, 723.89)
            .image(`${process.env.ROOT}/public/res/barcodes/${loancard_id}_128.png`, 28,  738.89, {width: 434, height: 75})
            .image(`${process.env.ROOT}/public/res/barcodes/${loancard_id}_qr.png`,  492, 738.89, {width: 75,  height: 75});
        };
    };
    function add_line(doc, line, y) {
        let y_c = 30;
        doc
            .text(line.qty,                                                            320, y)
            .text(line.size.item.description,                                           28, y)
            .text(`${fn.print_size_text(line.size.item)}: ${fn.print_size(line.size)}`, 28, y+15);
        if (line.nsn) {
            doc.text(`NSN: ${fn.print_nsn(line.nsn)}`,  28, y+y_c);
            y_c += 15;
        };
        if (line.serial) {
            doc.text(`Serial #: ${line.serial.serial}`, 28, y+y_c);
            y_c += 15;
        };
        doc
            .moveTo(28,  y+y_c).lineTo(567, y+y_c).stroke()
            .moveTo(315, y)    .lineTo(315, y+y_c).stroke()
            .moveTo(345, y)    .lineTo(345, y+y_c).stroke()
            .moveTo(445, y)    .lineTo(445, y+y_c).stroke();
        return y_c;
    };
    fn.loancards.createPDF = function (loancard_id) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'loancards',
                {loancard_id: loancard_id},
                [
                    fn.inc.users.user(),
                    fn.inc.users.user({
                        as: 'user_loancard',
                        attributes: ['user_id', 'surname', 'first_name', 'service_number']
                    })
                ]
            )
            .then(loancard => {
                if (loancard.status !== 2) reject(new Error('This loancard is not complete'))
                else {
                    return m.loancard_lines.findAll({
                        where: {
                            loancard_id: loancard.loancard_id,
                            status:      2
                        },
                        include: [
                            fn.inc.stores.serial(),
                            fn.inc.stores.nsn(),
                            fn.inc.stores.size()
                        ]
                    })
                    .then(lines => {
                        if (!lines || lines.length === 0) reject(new Error('No open lines on this loancard'))
                        else {
                            return fn.create_barcodes(loancard.loancard_id)
                            .then(result => {
                                return createFile(loancard)
                                .then(([doc, file, writeStream]) => {
                                    let y = addPage(doc);
                                    y += addLogos(doc, y);
                                    y += addHeader(doc, loancard, y);
                                    lines.forEach(line => {
                                        if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                                            doc.text('END OF PAGE', 28, y, {width: 539, align: 'center'});
                                            y  = addPage(doc);
                                            y += addHeader(doc, loancard, y);
                                        };
                                        y += add_line(doc, line, y);
                                    });
                                    addDeclaration(doc, lines.length, y);
                                    addPageNumbers(doc, loancard.loancard_id);
                                    doc.end();
                                    writeStream.on('error', err => reject(err));
                                    writeStream.on('finish', function () {
                                        fn.update(loancard, {filename: file})
                                        .then(result => {
                                            return fn.settings.get('Print loancard')
                                            .then(settings => {
                                                if (settings.length !== 1 ||settings[0].value !== '1') resolve(file)
                                                else {
                                                    return fn.print_pdf(`${process.env.ROOT}/public/res/loancards/${file}`)
                                                    .then(result => resolve(file))
                                                    .catch(err => {
                                                        console.log(err);
                                                        resolve(file);
                                                    });
                                                };
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                resolve(file)
                                            });
                                        })
                                        .catch(err => reject(err));
                                    });
                                })
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
    };
    fn.loancards.cancel = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'loancards',
                {loancard_id: options.loancard_id}
            )
            .then(loancard => {
                if      (loancard.status === 0) reject(new Error('This loancard has already been cancelled'))
                else if (loancard.status === 2) reject(new Error('This loancard has already been completed'))
                else if (loancard.status === 3) reject(new Error('This loancard has already been closed'))
                else if (loancard.status === 1) {
                    let catch_opts = [2, 3];
                    if (options.noForce) catch_opts.push(1);
                    return m.loancard_lines.count({
                        where: {
                            loancard_id: loancard.loancard_id,
                            status: {[fn.op.or]: catch_opts}
                        }
                    })
                    .then(line_count => {
                        if (line_count && line_count > 0) reject(new Error(`Can not cancel a loancard with ${(options.noForce === true ? 'draft, ' : '')}complete or returned lines`))
                        else {
                            let actions = [];
                            actions.push(fn.update(loancard, {status: 0}));
                            actions.push(
                                new Promise((resolve, reject) => {
                                    return m.loancard_lines.findAll({
                                        where: {
                                            loancard_id: loancard.loancard_id,
                                            status:      1
                                        }
                                    })
                                    .then(lines => {
                                        let line_actions = [];
                                        lines.forEach(line => {
                                            line_actions.push(fn.loancards.lines.cancel({loancard_line_id: line.loancard_line_id, user_id: options.user_id}))
                                        });
                                        return Promise.allSettled(line_actions)
                                        .then(action => resolve(true))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                }));
                            return Promise.all(actions)
                            .then(result => {
                                if (!result) reject(new Error('Loancard not updated'))
                                else {
                                    return fn.actions.create(
                                        'CANCELLED',
                                        options.user_id,
                                        [{table: 'loancards', id: loancard.loancard_id}]
                                    )
                                    .then(action => resolve(true))
                                    .catch(err => resolve(false));
                                };
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                } else reject(new Error('Unknown loancard status'));
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.loancards.findOrCreate({
                where: {
                    user_id_loancard: options.user_id_loancard,
                    status:           1
                },
                defaults: {user_id: options.user_id}
            })
            .then(([loancard, created]) => resolve(loancard.loancard_id))
            .catch(err => reject(err));
        });
    };
    fn.loancards.complete = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'loancards',
                {loancard_id: options.loancard_id}
            ) 
            .then(loancard => {
                if (loancard.status !== 1) reject(new Error('Loancard is not in draft'))
                else {
                    return m.loancard_lines.findAll({
                        where: {
                            loancard_id: loancard.loancard_id,
                            status:      {[fn.op.or]: [1, 2]}
                        }
                    })
                    .then(lines => {
                        if (!lines || lines.length === 0) reject(new Error('No open lines'))
                        else {
                            let actions = [];
                            actions.push(fn.update(loancard, {
                                status:   2,
                                date_due: options.date_due
                            }));
                            lines.forEach(line => {
                                actions.push(new Promise((resolve, reject) => {
                                    fn.update(line, {status: 2})
                                    .then(result => {
                                        return fn.actions.create(
                                            'COMPLETED',
                                            options.user_id,
                                            [{table: 'loancard_lines', id: line.loancard_line_id}]
                                        )
                                        .then(action => resolve(true))
                                        .catch(err => resolve(false));
                                    })
                                    .catch(err => reject(err));
                                }));
                            });
                            actions.push(m.loancard_lines.update(
                                {status: 2},
                                {where: {
                                    loancard_id: loancard.loancard_id,
                                    status:      {[fn.op.or]: [1, 2]}
                                }}
                            ));
                            return Promise.all(actions)
                            .then(result => {
                                return fn.actions.create(
                                    'COMPLETED',
                                    options.user_id,
                                    [{table: 'loancards', id: loancard.loancard_id}]
                                )
                                .then(action => resolve(true))
                                .catch(err => resolve(false));
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
    fn.loancards.close = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'loancards',
                {loancard_id: options.loancard_id}
            )
            .then(loancard => {
                return m.loancard_lines.count({
                    where: {
                        loancard_id: loancard.loancard_id,
                        status:   {[fn.op.or]: [1, 2]}
                    }
                })
                .then(line_count => {
                    if (line_count > 0) resolve(false)
                    else {
                        return fn.update(loancard, {status: 3})
                        .then(result => {
                            return fn.actions.create(
                                'CLOSED',
                                options.user_id,
                                [{table: 'loancards', id: loancard.loancard_id}]
                            )
                            .then(action => resolve(true))
                            .catch(err => resolve(true));
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.delete_file = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'loancards',
                {loancard_id: options.loancard_id}
            )
            .then(loancard => {
                if (loancard.filename) {
                    return fn.file_exists(`${process.env.ROOT}/public/res/loancards/${loancard.filename}`)
                    .then(filepath => {
                        return fn.rm(filepath)
                        .then(result => {
                            return fn.update(loancard, {filename: null})
                            .then(result => {
                                fn.actions.create(
                                    'File deleted',
                                    options.user_id,
                                    [{table: 'loancards', id: loancard.loancard_id}]
                                )
                                .then(result => resolve(true))
                                .catch(err => {
                                    console.log(err);
                                    resolve(true);
                                });
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                } else reject(new Error('No file for this loancard'));
            })
            .catch(err => reject(err));
        });
    };

    function check_nsn(size, options = {}) {
        return new Promise((resolve, reject) => {
            if      (!size.has_nsns)  resolve(null)
            else if (!options.nsn_id) reject(new Error('No NSN ID submitted'))
            else {
                return fn.get(
                    'nsns',
                    {nsn_id: options.nsn_id}
                )
                .then(nsn => {
                    if (nsn.size_id !== size.size_id) reject(new Error('NSN is not for this size'))
                    else resolve(nsn.nsn_id);
                })
                .catch(err => reject(err));
            };
        });
    };
    function check_serial(size, options = {}) {
        return new Promise((resolve, reject) => {
            if (!options.serial_id) reject(new Error('No Serial ID submitted'))
            else {
                return fn.get(
                    'serials',
                    {serial_id: options.serial_id}
                )
                .then(serial => {
                    if (serial.size_id !== size.size_id) reject(new Error('Serial # is not for this size'))
                    else resolve(serial);
                })
                .catch(err => reject(err));
            };
        });
    };
    function check_stock(size, options = {}) {
        return new Promise((resolve, reject) => {
            if (!options.stock_id) reject(new Error('No Stock ID submitted'))
            else {
                return fn.get(
                    'stocks',
                    {stock_id: options.stock_id}
                )
                .then(stock => {
                    if (stock.size_id !== size.size_id) reject(new Error('Stock record is not for this size'))
                    else resolve(stock);
                })
                .catch(err => reject(err));
            };
        });
    };
    function add_serial(size, nsn_id, loancard_id, options) {
        return new Promise((resolve, reject) => {
            return check_serial(size, options)
            .then(serial => {
                return m.loancard_lines.create({
                    loancard_id: loancard_id,
                    serial_id:   serial.serial_id,
                    size_id:     size.size_id,
                    nsn_id:      nsn_id,
                    qty:         1,
                    user_id:     options.user_id
                })
                .then(loancard_line => {
                    return fn.update(serial, {
                        issue_id: options.issue_id,
                        location_id: null
                    })
                    .then(result => resolve([
                        {table: 'serials', id: serial.serial_id},
                        {table: 'loancard_lines', id: loancard_line.loancard_line_id}
                    ]))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function add_stock(size, nsn_id, loancard_id, options) {
        return new Promise((resolve, reject) => {
            return check_stock(size, options)
            .then(stock => {
                return m.loancard_lines.findOrCreate({
                    where: {
                        loancard_id: loancard_id,
                        status:      1,
                        size_id:     size.size_id,
                        nsn_id:      nsn_id
                    },
                    defaults: {
                        qty:     options.qty,
                        user_id: options.user_id,
                    }
                })
                .then(([loancard_line, created]) => {
                    return fn.decrement(stock, options.qty)
                    .then(result => {
                        if (created) {
                            resolve([
                                {table: 'stocks', id: stock.stock_id},
                                {table: 'loancard_lines', id: loancard_line.loancard_line_id}
                            ]);
                        } else {
                            return fn.increment(loancard_line, options.qty)
                            .then(result => {
                                resolve([
                                    {table: 'stocks', id: stock.stock_id},
                                    {table: 'loancard_lines', id: loancard_line.loancard_line_id}
                                ]);
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function get_loancard_link(table, loancard_line_id) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'action_links',
                {_table: table},
                [
                    fn.inc.stores.actions({
                        where: {action: 'Issue added to loancard'},
                        include: [
                            fn.inc.stores.action_links({where: {
                                _table: 'loancard_lines',
                                id:     loancard_line_id
                            }})
                        ]
                    })
                ]
            )
            .then(link => resolve(link))
            .catch(err => reject(err));
        });
    };
    function get_loancard_links(table, loancard_line_id) {
        return new Promise((resolve, reject) => {
            return m.action_links.findAll({
                where: {_table: table},
                include: [
                    fn.inc.stores.actions({
                        where: {action: 'Issue added to loancard'},
                        include: [
                            fn.inc.stores.action_links({where: {
                                _table: 'loancard_lines',
                                id:     loancard_line_id
                            }})
                        ]
                    })
                ]
            })
            .then(link => {
                if (!link) reject(new Error(`No link found for ${table}`))
                else resolve(link)
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.lines.cancel = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'loancard_lines',
                {loancard_line_id: options.loancard_line_id}
            )
            .then(line => {
                if      (line.status === 0) reject(new Error('This line has already been cancelled'))
                else if (line.status === 2) reject(new Error('This line has already been completed'))
                else if (line.status === 3) reject(new Error('This line has already been returned'))
                else if (line.status === 1) {
                    return fn.update(line, {status: 0})
                    .then(result => {
                        let cancel_action = null;
                        if (line.serial_id) {
                            cancel_action = new Promise((resolve, reject) => {
                                return get_loancard_link('locations', line.loancard_line_id)
                                .then(link => {
                                    return fn.get(
                                        'locations',
                                        {location_id: link.id}
                                    )
                                    .then(location => {
                                        return fn.serials.return_to_stock(line.serial_id, location.location_id)
                                        .then(serial => resolve({issue_ids: [serial.issue_id], links: [{table: 'serials', id: serial.serial_id}]}))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            });
                        } else {
                            cancel_action = new Promise((resolve, reject) => {
                                return get_loancard_link('stocks', line.loancard_line_id)
                                .then(link => {
                                    return fn.get(
                                        'stocks',
                                        {stock_id: link.id}
                                    )
                                    .then(stock => {
                                        return fn.increment(stock, line.qty)
                                        .then(result => {
                                            return get_loancard_links('issues', line.loancard_line_id)
                                            .then(issue_links => {
                                                let issues = [];
                                                issue_links.forEach(link => issues.push(link.id));
                                                resolve({issue_ids: issues, links: [{table: 'stocks', id: stock.stock_id}]});
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            });
                        };
                        return cancel_action
                        .then(result => {
                            let issue_actions = [];
                            result.issue_ids.forEach(issue_id => {
                                issue_actions.push(new Promise((resolve, reject) => {
                                    return fn.get(
                                        'issues',
                                        {issue_id: issue_id}
                                    )
                                    .then(issue => {
                                        return fn.update(issue, {status: 2})
                                        .then(result => resolve({table: 'issues', id: issue.issue_id}))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                }));
                            });
                            return Promise.allSettled(issue_actions)
                            .then(results => {
                                let issue_links = [];
                                results.filter(e => e.status === 'fulfilled').forEach(e => issue_links.push(e.value));
                                return fn.actions.create(
                                    'CANCELLED',
                                    options.user_id,
                                    [{table: 'loancard_lines', id: line.loancard_line_id}].concat(result.links).concat(issue_links)
                                )
                                .then(result => resolve(line.loancard_id))
                                .catch(err => {
                                    console.log(err);
                                    resolve(line.loancard_id)
                                });
                            })
                            .catch(err => reject(err));

                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                } else reject(new Error('Unknown line status'));
            })
            .catch(err => reject(err));
        });
    };

    fn.loancards.lines.create = function(options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'issues',
                {issue_id: options.issue_id}
            )
            .then(issue => {
                return fn.get(
                    'loancards',
                    {loancard_id: options.loancard_id}
                )
                .then(loancard => {
                    return fn.get(
                        'sizes',
                        {size_id: issue.size_id}
                    )
                    .then(size => {
                        return check_nsn(size, options)
                        .then(nsn_id => {
                            let action = null;
                            if (size.has_serials) action = add_serial(size, nsn_id, loancard.loancard_id, options)
                            else                  action = add_stock( size, nsn_id, loancard.loancard_id, options);
                            return action
                            .then(action_links => {
                                return fn.update(issue, {status: 4})
                                .then(result => {
                                    return fn.actions.create(
                                        'Issue added to loancard',
                                        options.user_id,
                                        [
                                            {table: 'issues', id: issue.issue_id},
                                            (nsn_id ? {table: 'nsns', id: nsn_id} : {})
                                        ].concat(action_links)
                                    )
                                    .then(action => resolve(true))
                                    .catch(err =>   resolve(false));
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
    };
    fn.loancards.lines.return = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'loancard_lines',
                {loancard_line_id: options.loancard_line_id}
            )
            .then(line => {
                if      (line.status === 0) reject(new Error('This line has been cancelled'))
                else if (line.status === 1) reject(new Error('This line is still pending'))
                else if (line.status === 3) reject(new Error('This line has already been returned'))
                else if (line.status === 2) {
                    return fn.get(
                        'sizes',
                        {size_id: line.size_id}
                    )
                    .then(size => {
                        return m.locations.findOrCreate({
                            where: {location: options.location}
                        })
                        .then(([location, created]) => {
                            let return_action = null;
                            if (line.serial_id) {
                                return_action = new Promise((resolve, reject) => {
                                    return fn.serials.return_to_stock(line.serial_id, location.location_id)
                                    .then(serial => resolve({issue_ids: [serial.issue_id], links: [{table: 'serials', id: serial.serial_id}]}))
                                    .catch(err => reject(err));
                                });
                            } else {
                                return_action = new Promise((resolve, reject) => {
                                    return m.stocks.findOrCreate({
                                        where: {
                                            size_id:     size.size_id,
                                            location_id: location.location_id
                                        }
                                    })
                                    .then(([stock, created]) => {
                                        return fn.increment(stock, line.qty)
                                        .then(result => {
                                            return get_loancard_links('issues', line.loancard_line_id)
                                            .then(links => {
                                                let issues = [];
                                                links.forEach(link => issues.push(link.id));
                                                resolve({issue_ids: issues, links: [{table: 'stocks', id: stock.stock_id}]})
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                });
                            };
                            return return_action
                            .then(result => {
                                let update_actions = [], issue_links = [];
                                if ((options.qty < line.qty) && options.qty >= 1) {
                                    update_actions.push(new Promise((resolve, reject) => {
                                        return m.loancard_lines.create({
                                            loancard_id: line.loancard_id,
                                            size_id:     line.size_id,
                                            serial_id:   line.serial_id,
                                            nsn_id:      line.nsn_id,
                                            qty:         line.qty - options.qty,
                                            status:      2,
                                            user_id:     line.user_id
                                        })
                                        .then(new_line => {
                                            return fn.update(line, {qty: options.qty})
                                            .then(result => {
                                                return fn.actions.create(
                                                    'Line created from partial return',
                                                    options.user_id,
                                                    [
                                                        {table: 'loancard_lines', id: line.loancard_line},
                                                        {table: 'loancard_lines', id: new_line.loancard_line}
                                                    ]
                                                )
                                                .then(result => resolve(true))
                                                .catch(err => {
                                                    console.log(err);
                                                    resolve(false);
                                                });
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    }));
                                };
                                result.issue_ids.forEach(issue_id => {
                                    update_actions.push(new Promise((resolve, reject) => {
                                        return fn.get(
                                            'issues',
                                            {issue_id: issue_id}
                                        )
                                        .then(issue => {
                                            if      (issue.status === 0) reject(new Error('Issue is already cancelled'))
                                            else if (issue.status === 1) reject(new Error('Issue is pending approval'))
                                            else if (issue.status === 2) reject(new Error('Issue is not issued'))
                                            else if (issue.status === 3) reject(new Error('Issue is ordered but not issued'))
                                            else if (issue.status === 4) {
                                                return fn.update(issue, {status: 5})
                                                .then(result => {
                                                    issue_links.push({table: 'issues', id: issue.issue_id})
                                                    resolve(true);
                                                })
                                                .catch(err => reject(err));
                                            } else reject(new Error('Unknown issue status'));
                                        })
                                    }));
                                })
                                update_actions.push(fn.update(line, {status: 3}));
                                return Promise.allSettled(update_actions)
                                .then(results => {
                                    if (results.filter(e => e.status === 'rejected').length > 0) console.log(results);
                                    return fn.actions.create(
                                        'RETURNED',
                                        options.user_id,
                                        [
                                            {table: 'loancard_lines', id: line.loancard_line_id},
                                            {table: 'locations',      id: location.location_id}
                                        ].concat(issue_links).concat(result.links)
                                    )
                                    .then(result => resolve(line.loancard_id))
                                    .catch(err => resolve(line.loancard_id));
                                })
                                .catch(err => resolve(line.loancard_id));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                } else reject(new Error('Unknown line status'));
            })
            .catch(err => reject(err));
        });
    };
};