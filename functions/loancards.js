module.exports = function (m, fn) {
    fn.loancards = {lines: {}};
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
    function addLogos(doc) {
        doc
        .image(`${process.env.ROOT}/public/img/rafac_logo.png`, 28, 55, {fit: [112, 168]})
        .image(`${process.env.ROOT}/public/img/sqnCrest.png`, 470.25, 55, {height: 100})
        .fontSize(30)
        .text('1801 SQUADRON ATC', 154.12, 48, {align: 'justify'})
        .text('STORES LOAN CARD',  163.89, 98, {align: 'justify'});
    };
    function addPage(doc) {
        let pageMetaData = {};
        pageMetaData.size    = 'A4';
        pageMetaData.margins = 28;
        doc.addPage(pageMetaData);
    };
    function addHeader(doc, loancard, offset = 140) {
        doc
        .fontSize(15)
        .text(`Rank: ${loancard.user_loancard.rank.rank}`,            28,  offset + 20)
        .text(`Surname: ${loancard.user_loancard.surname}`,           140, offset + 20)
        .text(`First Name: ${loancard.user_loancard.first_name}`,     380, offset + 20)
        .text(`Service #: ${loancard.user_loancard.service_number}`,  28,  offset + 40)
        .text(`Date: ${new Date(loancard.createdAt).toDateString()}`, 415, offset + 40)
        .fontSize(10)
        .text('Item',        161.29,  offset + 65)
        .text('Qty',         320,     offset + 65)
        .text('Return Date', 368.275, offset + 65)
        .text('Signature',   484.365, offset + 65)
        .moveTo( 28, offset + 20).lineTo(567.28, offset + 20).stroke()
        .moveTo( 28, offset + 60).lineTo(567.28, offset + 60).stroke()
        .moveTo( 28, offset + 85).lineTo(567.28, offset + 85).stroke()
        .moveTo(315, offset + 60).lineTo(315,    offset + 85).stroke()
        .moveTo(345, offset + 60).lineTo(345,    offset + 85).stroke()
        .moveTo(445, offset + 60).lineTo(445,    offset + 85).stroke();
    };
    function addDeclaration(doc, count, y) {
        let close_text = `END OF LOANCARD, ${count} LINES ISSUED`,
            disclaimer = 'By signing in the box below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
        doc.text(close_text, 297.64 - (doc.widthOfString(close_text) / 2), y);
        y += 20;
        doc
        .text(disclaimer, 28, y, {width: 539.28, align: 'center'})
        .rect(197.64, y += 30, 200, 100).stroke();
    };
    function addPageNumbers(doc, loancard_id) {
        const range = doc.bufferedPageRange();
        doc.fontSize(15);
        for (let i = range.start; i < range.count; i++) {
            doc
            .switchToPage(i);
            doc
            .text(`Page ${i + 1} of ${range.count}`, 28, 28)
            .image(`${process.env.ROOT}/public/res/barcodes/${loancard_id}.png`, 28, 780, {width: 539.28, height: 50});
        };
    };
    fn.loancards.get = function (loancard_id) {
        return new Promise((resolve, reject) => {
            return m.loancards.findOne({
                where: {loancard_id: loancard_id},
                include: [
                    {model: m.users, as: 'user',          include: [{model: m.ranks, as: 'rank'}]},
                    {model: m.users, as: 'user_loancard', include: [{model: m.ranks, as: 'rank'}]}
                ]
            })
            .then(loancard => {
                if (!loancard) reject(new Error('Loancard not found'))
                else  resolve(loancard);
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.createPDF = function (loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(loancard_id)
            .then(loancard => {
                if      (!loancard)             reject(new Error('Loancard not found'))
                else if (loancard.status !== 2) reject(new Error('This loancard is not complete'))
                else {
                    return m.loancard_lines.findAll({
                        where: {
                            loancard_id: loancard.loancard_id,
                            status:      2
                        },
                        include: [
                            {model: m.serials, as: 'serial'},
                            {model: m.nsns,    as: 'nsn',  include: [
                                {model: m.nsn_classes,   as: 'nsn_class'},
                                {model: m.nsn_groups,    as: 'nsn_group'},
                                {model: m.nsn_countries, as: 'nsn_country'}
                            ]},
                            {model: m.sizes,   as: 'size', include: [
                                {model: m.items, as: 'item'}
                            ]}
                        ]
                    })
                    .then(lines => {
                        if (!lines || lines.length === 0) reject(new Error('No open lines on this loancard'))
                        else {
                            return fn.create_barcode(loancard.loancard_id)
                            .then(barcodeCreated => {
                                return createFile(loancard)
                                .then(([doc, file, writeStream]) => {
                                    addPage(doc);
                                    addLogos(doc);
                                    addHeader(doc, loancard);
                                    let y = 225;
                                    lines.forEach(line => {
                                        if (y >= 761.89) {
                                            doc.text('END OF PAGE', 268, y);
                                            addPage(doc);
                                            addHeader(doc, loancard, 30);
                                            y = 115;
                                        };
                                        let y_0 = y;
                                        doc.text(line.qty,                  320, y);
                                        doc.text(line.size.item.description, 28, y);
                                        y += 15;
                                        doc.text(`${line.size.item.size_text}: ${line.size.size}`, 28, y);
                                        if (line.nsn) {
                                            y += 15;
                                            doc.text(`NSN: ${String(line.nsn.nsn_group.code).padStart(2, '0')}${String(line.nsn.nsn_class.code).padStart(2, '0')}-${String(line.nsn.nsn_country.code).padStart(2, '0')}-${line.nsn.item_number}`, 28, y);
                                        };
                                        if (line.serial) {
                                            y += 15;
                                            doc.text(`Serial #: ${line.serial.serial}`, 28, y);
                                        };
                                        y += 15;
                                        doc
                                        .moveTo(28, y).lineTo(567.28, y).stroke()
                                        .moveTo(315, y_0).lineTo(315, y).stroke()
                                        .moveTo(345, y_0).lineTo(345, y).stroke()
                                        .moveTo(445, y_0).lineTo(445, y).stroke();
                                    });
                                    addDeclaration(doc, lines.length, y);
                                    addPageNumbers(doc, loancard.loancard_id);
                                    doc.end();
                                    writeStream.on('error', err => reject(err));
                                    writeStream.on('finish', function () {
                                        m.loancards.update(
                                            {filename: file},
                                            {where: {loancard_id: loancard.loancard_id}}
                                        )
                                        .then(result => {
                                            return fn.settings.get('Print loancard')
                                            .then(settings => {
                                                if      (settings.length !== 1)     resolve(file)
                                                else if (settings[0].value !== '1') resolve(file)
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
            fn.loancards.get(options.loancard_id)
            .then(loancard => {
                if      (loancard.status === 0) reject(new Error('This loancard has already been cancelled'))
                else if (loancard.status === 2) reject(new Error('This loancard has already been completed'))
                else if (loancard.status === 3) reject(new Error('This loancard has already been closed'))
                else if (loancard.status === 1) {
                    return m.loancard_lines.count({
                        where: {
                            loancard_id: loancard.loancard_id,
                            status: {[fn.op.or]: [2, 3]}
                        }
                    })
                    .then(line_count => {
                        if (line_count && line_count.length > 0) reject(new Error('Can not cancel a loancard with complete or returned lines'))
                        else {
                            let actions = [];
                            actions.push(loancard.update({status: 0}));
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
                                    return fn.actions.create({
                                        action: 'Loancard cancelled',
                                        user_id: options.user_id,
                                        links: [{table: 'loancards', id: loancard.loancard_id}]
                                    })
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
                defaults: {
                    user_id:  options.user_id,
                    date_due: options.date_due || fn.addYears(7)
                }
            })
            .then(([loancard, created]) => resolve(loancard.loancard_id))
            .catch(err => reject(err));
        });
    };
    fn.loancards.complete = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(options.loancard_id) 
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
                            actions.push(loancard.update({status: 2}));
                            lines.forEach(line => {
                                actions.push(new Promise((resolve, reject) => {
                                    line.update({status: 2})
                                    .then(result => {
                                        return fn.actions.create({
                                            action:  'Loancard completed',
                                            user_id: options.user_id,
                                            links: [{table: 'loancard_lines', id: line.loancard_line_id}]
                                        })
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
                                return fn.actions.create({
                                    action:  'Loancard completed',
                                    user_id: options.user_id,
                                    links: [{table: 'loancards', id: loancard.loancard_id}]
                                })
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
            return fn.loancards.get(options.loancard_id)
            .then(loancard => {
                return m.loancard_lines.count({
                    loancard: loancard.loancard_id,
                    status:   {[fn.op.or]: [1, 2]}
                })
                .then(line_count => {
                    if (line_count > 0) resolve(false)
                    else {
                        return loancard.update({status: 3})
                        .then(result => {
                            if (!result) reject(new Error('Loancard not updated'))
                            else {
                                return fn.actions.create({
                                    action:  'Loancard closed',
                                    user_id: options.user_id,
                                    links: [{table: 'loancards', id: loancard.loancard_id}]
                                })
                                .then(action => resolve(true))
                                .catch(err => resolve(true))
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function check_nsn(size, options = {}) {
        return new Promise((resolve, reject) => {
            if      (!size.has_nsns)  resolve(null)
            else if (!options.nsn_id) reject(new Error('No NSN ID submitted'))
            else {
                return m.nsns.findOne({where: {nsn_id: options.nsn_id}})
                .then(nsn => {
                    if      (!nsn)                         reject(new Error('NSN not found'))
                    else if (nsn.size_id !== size.size_id) reject(new Error('NSN is not for this size'))
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
                return m.serials.findOne({where: {serial_id: options.serial_id}})
                .then(serial => {
                    if      (!serial)                         reject(new Error('Serial # not found'))
                    else if (serial.size_id !== size.size_id) reject(new Error('Serial # is not for this size'))
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
                return m.stocks.findOne({where: {stock_id: options.stock_id}})
                .then(stock => {
                    if      (!stock)                         reject(new Error('Stock record not found'))
                    else if (stock.size_id !== size.size_id) reject(new Error('Stock record is not for this size'))
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
                    return serial.update({
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
                    return stock.decrement('qty', {by: options.qty})
                    .then(result => {
                        if (created) {
                            resolve([
                                {table: 'stocks', id: stock.stock_id},
                                {table: 'loancard_lines', id: loancard_line.loancard_line_id}
                            ]);
                        }else {
                            return loancard_line.increment('qty', {by: options.qty})
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
    fn.loancards.lines.get = function (loancard_line_id) {
        return new Promise((resolve, reject) => {
            return m.loancard_lines.findOne({
                where: {loancard_line_id: loancard_line_id},
                include: [{model: m.sizes, as: 'size'}]
            })
            .then(line => {
                if (!line) reject(new Error('Loancard line not found'))
                else       resolve(line);
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.lines.cancel = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.loancards.lines.get(options.loancard_line_id)
            .then(line => {
                if      (!line.size)        reject(new Error('Size not found'))
                else if (line.status !== 1) reject(new Error('Only pending lines can be cancelled'))
                else {
                    return line.update({status: 0})
                    .then(result => {
                        if      (!result) reject(new Error('Line not updated'))
                        else {
                            let cancel_action = null;
                            if (line.serial_id) {
                                cancel_action = new Promise((resolve, reject) => {
                                    return m.serials.findOne({serial_id: line.serial_id})
                                    .then(serial => {
                                        if (!serial) reject(new Error('Serial # not found'))
                                        else {
                                            return m.actions.findOne({
                                                where: {action: 'Issue added to loancard'},
                                                include: [{
                                                    model:    m.action_links,
                                                    as:       'links',
                                                    required: true,
                                                    where: {
                                                        _table: 'loancard_lines',
                                                        id:     line.loancard_line_id
                                                    }
                                                }]
                                            })
                                            .then(action => {
                                                if (!action) reject(new Error('No action found'))
                                                else {
                                                    return m.action_links.findOne({
                                                        where: {
                                                            action_id: action.action_id,
                                                            _table:    'locations'
                                                        }
                                                    })
                                                    .then(link => {
                                                        if (!link) reject(new Error('No location link found'))
                                                        else {
                                                            return serial.update({
                                                                location_id: link.id,
                                                                issue_id:    null
                                                            })
                                                            .then(result => {
                                                                if (!result) reject(new Error('Serial not updated'))
                                                                else {
                                                                    return m.action_links.findAll({
                                                                        where: {
                                                                            action_id: action.action_id,
                                                                            _table: 'issues'
                                                                        }
                                                                    })
                                                                    .then(links => {
                                                                        let issue_links = [];
                                                                        links.forEach(link => issue_links.push(link.id));
                                                                        resolve(issue_links);
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
                                        };
                                    })
                                    .catch(err => reject(err));
                                });
                            } else {
                                cancel_action = new Promise((resolve, reject) => {
                                    return m.actions.findAll({
                                        where: {action: 'Issue added to loancard'},
                                        include: [{
                                            model:    m.action_links,
                                            as:       'links',
                                            required: true,
                                            where: {
                                                _table: 'loancard_lines',
                                                id:     line.loancard_line_id
                                            }
                                        }]
                                    })
                                    .then(actions => {
                                        if (!actions || actions.length === 0) resolve(false)
                                        else {
                                            let line_actions = [];
                                            actions.forEach(action => {
                                                line_actions.push(new Promise((resolve, reject) => {
                                                    return m.action_links.findOne({
                                                        where: {
                                                            action_id: action.action_id,
                                                            _table: 'issues'
                                                        }
                                                    })
                                                    .then(link => {
                                                        if (!link) reject(new Error('Link not found'))
                                                        else {
                                                            return m.issues.findOne({where: {issue_id: link.id}})
                                                            .then(issue => {
                                                                if (!issue) reject(new Error('issue not found'))
                                                                else {
                                                                    
                                                                };
                                                            })
                                                            .catch(err => reject(err));
                                                        };
                                                    })
                                                    .catch(err => reject(err));
                                                }));
                                            });
                                            return m.stocks.findOne({where: {stock_id: actions[actions.length - 1].stock_id}})
                                            .then(stock => {
                                                if (!stock) resolve(false)
                                                else {
                                                    return stock.increment('qty', {by: line.qty})
                                                    .then(result => {
                                                        if (!result) resolve(false)
                                                        else {
                                                            return m.issues.findOne({where: {issue_id: actions[actions.length - 1].issue_id}})
                                                            .then(issue => {
                                                                if      (!issue)                                 resolve(true)
                                                                else if ([0, 1, 2, 3, 5].includes(issue.status)) resolve(true)
                                                                else {
                                                                    return issue.update({status: 2})
                                                                    .then(result => {
                                                                        if (!result) resolve(true)
                                                                        else {
                                                                            return fn.actions.create({
                                                                                action:  'Loancard line cancelled',
                                                                                user_id: options.user_id,
                                                                                links: [{table: 'loancard_lines', id: line.loancard_line_id}]
                                                                            })
                                                                            .then(action => resolve(true))
                                                                            .catch(err => {
                                                                                console.log(err);
                                                                                resolve(false);
                                                                            });
                                                                        };
                                                                    })
                                                                    .catch(err => {
                                                                        console.log(err);
                                                                        resolve(false);
                                                                    });
                                                                };
                                                            })
                                                            .catch(err => {
                                                                console.log(err);
                                                                resolve(false);
                                                            });
                                                        };
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                        resolve(false);
                                                    })
                                                };
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                resolve(false);
                                            });
                                        };
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        resolve(false);
                                    });
                                });
                            };
                            return cancel_action
                            .then(issues => {

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

    fn.loancards.lines.create = function(options = {}) {
        return new Promise((resolve, reject) => {
            return m.issues.findOne({where: {issue_id: options.issue_id}})
            .then(issue => {
                return fn.loancards.get(options.loancard_id)
                .then(loancard => {
                    return m.sizes.findOne({
                        where:      {size_id: issue.size_id},
                        attributes: ['size_id', 'has_serials', 'has_nsns']
                    })
                    .then(size => {
                        if (!size) reject(new Error('Size not found'))
                        else {
                            return check_nsn(size, options)
                            .then(nsn_id => {
                                let action = null;
                                if (size.has_serials) action = add_serial(size, nsn_id, loancard.loancard_id, options)
                                else                  action = add_stock( size, nsn_id, loancard.loancard_id, options);
                                return action
                                .then(action_details => {
                                    return issue.update({status: 4})
                                    .then(result => {
                                        return fn.actions.create({
                                            action:  'Issue added to loancard',
                                            user_id: options.user_id,
                                            links: [
                                                {table: 'issues', id: issue.issue_id},
                                                (nsn_id ? {table: 'nsns', id: nsn_id} : {})
                                            ].concat(action_details)
                                        })
                                        .then(action => resolve(true))
                                        .catch(err =>   resolve(false));
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        };
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
            return fn.loancards.lines.get(options.loancard_line_id)
            .then(line => {
                if      (line.status === 0) reject(new Error('This line has been cancelled'))
                else if (line.status === 1) reject(new Error('This line is still pending'))
                else if (line.status === 3) reject(new Error('This line has already been returned'))
                else if (line.status === 2) {
                    return m.sizes.findOne({
                        where: {size_id: line.size_id}
                    })
                    .then(size => {
                        return m.locations.findOrCreate({
                            where: {location: options.location}
                        })
                        .then(([location, created]) => {
                            let return_action = null;
                            if (line.serial_id) {
                                return_action = new Promise((resolve, reject) => {
                                    return m.serials.findOne({where: {serial_id: line.serial_id}})
                                    .then(serial => {
                                        if      (!serial)            reject(new Error('Serial # not found'))
                                        else if (!serial.issue_id)   reject(new Error('Serial # not issued'))
                                        else if (serial.location_id) reject(new Error('Serial # already in stock'))
                                        else {
                                            return serial.update({
                                                location_id: location.location_id,
                                                issue_id:    null
                                            })
                                            .then(result => {
                                                if (!result) reject(new Error('Serial # not updated'))
                                                else resolve([serial.issue_id]);
                                            })
                                            .catch(err => reject(err));
                                        };
                                    })
                                    .catch(err => reject(err));
                                });
                            } else {
                                return_action = new Promise((resolve, reject) => {
                                    return m.stocks.findOrCreate({
                                        where: {
                                            size_id: size.size_id,
                                            location_id: location.location_id
                                        }
                                    })
                                    .then(([stock, created]) => {
                                        return stock.increment('qty', {by: line.qty})
                                        .then(result => {
                                            if (!result) reject(new Error('Stock not returned'))
                                            else {
                                                return m.actions.findAll({
                                                    where: {action: 'Issue added to loancard'},
                                                    include: [{
                                                        model: m.action_links,
                                                        as:    'links',
                                                        where: {
                                                            _table: 'loancard_lines',
                                                            id:     line.loancard_line_id
                                                        },
                                                        required: true
                                                    }]
                                                })
                                                .then(actions => {
                                                    let _actions = [], issue_list = [];
                                                    actions.forEach(action => {
                                                        _actions.push(new Promise((resolve, reject) => {
                                                            return m.action_links.findAll({
                                                                where:   {
                                                                    action_id: action.action_id,
                                                                    _table:    'issues'
                                                                }
                                                            })
                                                            .then(links => {
                                                                links.forEach(link => issue_list.push(link.id));
                                                                resolve(true);
                                                            })
                                                            .catch(err => reject(err));
                                                        }));
                                                    });
                                                    return Promise.allSettled(_actions)
                                                    .then(results => resolve(issue_list))
                                                    .catch(err => reject(err));
                                                })
                                                .catch(err => reject(err));
                                            };
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                });
                            };
                            return return_action
                            .then(issues => {
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
                                            return line.update({qty: options.qty})
                                            .then(result => {
                                                if (!result) reject(new Error('Line not updated'))
                                                else {
                                                    return fn.actions.create({
                                                        action: 'Line created from partial return',
                                                        user_id: options.user_id,
                                                        links: [
                                                            {table: 'loancard_lines', id: line.loancard_line},
                                                            {table: 'loancard_lines', id: new_line.loancard_line}
                                                        ]
                                                    })
                                                    .then(result => resolve(true))
                                                    .catch(err => {
                                                        console.log(err);
                                                        resolve(false);
                                                    })
                                                }
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    }));
                                };
                                issues.forEach(issue_id => {
                                    update_actions.push(new Promise((resolve, reject) => {
                                        return m.issues.findOne({where: {issue_id: issue_id}})
                                        .then(issue => {
                                            if      (!issue)             reject(new Error('Issue not found'))
                                            else if (issue.status === 0) reject(new Error('Issue is already cancelled'))
                                            else if (issue.status === 1) reject(new Error('Issue is pending approval'))
                                            else if (issue.status === 2) reject(new Error('Issue is not issued'))
                                            else if (issue.status === 3) reject(new Error('Issue is ordered but not issued'))
                                            else if (issue.status === 4) {
                                                return issue.update({status: 5})
                                                .then(result => {
                                                    if (!result) reject(new Error('Issue not updated'))
                                                    else {
                                                        issue_links.push({table: 'issues', id: issue.issue_id})
                                                        resolve(true);
                                                    };
                                                })
                                                .catch(err => reject(err));
                                            } else reject(new Error('Unknown issue status'));
                                        })
                                    }));
                                })
                                update_actions.push(line.update({status: 3}));
                                return Promise.allSettled(update_actions)
                                .then(results => {
                                    if (results.filter(e => e.status !== 'rejected').length > 0) console.log(results);
                                    return fn.actions.create({
                                        action:  'Loancard line returned',
                                        user_id: options.user_id,
                                        links: [
                                            {table: 'loancard_lines', id: line.loancard_line_id},
                                            {table: 'locations',      id: location.location_id}
                                        ].concat(issue_links)
                                    })
                                    .then(result => resolve(true))
                                    .catch(err => resolve(false));
                                })
                                .catch(err => resolve(false));
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