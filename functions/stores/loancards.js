module.exports = function (m, fn) {
    fn.loancards = {lines: {}};
    fn.loancards.get = function (loancard_id) {
        return new Promise((resolve, reject) => {
            m.loancards.findOne({
                where: {loancard_id: loancard_id},
                include: [
                    fn.inc.users.user(),
                    fn.inc.users.user({as: 'user_loancard'})
                ]
            })
            .then(loancard => {
                if (loancard) resolve(laoncard)
                else reject(new Error('Loancard not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.edit = function (loancard_id, details) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(loancard_id)
            .then(loancard => {
                loancard.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    //string height @ 30: 38.19
    //string height @ 15: 19.095
    //string height @ 10: 12.7299999
    // A4 (595.28 x 841.89)
    function addHeader(doc, loancard, y) {
        doc
            .fontSize(15)
            .text(`Rank: ${     (loancard.user_loancard.rank ? loancard.user_loancard.rank.rank : "")}`, 28, y)
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
        if (y >= 640) fn.files.add.EndOfPage(doc, y);
        let close_text = `END OF LOANCARD, ${count} LINE(S) ISSUED`,
            disclaimer = 'By signing in the box below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
        doc
            .text(close_text, 28, y,    {width: 539, align: 'center'})
            .text(disclaimer, 28, y+20, {width: 539, align: 'center'})
            .rect(197.64, y+50, 200, 100).stroke();
    };
    function addLine(doc, line, y) {
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
            fn.loancards.get(loancard_id)
            .then(loancard => {
                if (loancard.status !== 2) reject(new Error('This loancard is not complete'))
                else {
                    m.loancard_lines.findAll({
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
                            fn.create_barcodes(loancard.loancard_id)
                            .then(result => {
                                fn.files.create(loancard.loancard_id, 'loancards', loancard.user_loancard.surname, loancard.user)
                                .then(([doc, file, writeStream]) => {
                                    let y = fn.files.add.Page(doc);
                                    y += fn.files.add.Logos(doc, y, 'STORES LOAN CARD');
                                    y += addHeader(doc, loancard, y);
                                    lines.forEach(line => {
                                        if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                                            y = fn.files.add.EndOfPage(doc, y);
                                            y += addHeader(doc, loancard, y);
                                        };
                                        y += addLine(doc, line, y);
                                    });
                                    addDeclaration(doc, lines.length, y);
                                    fn.files.add.PageNumbers(doc, loancard.loancard_id);
                                    doc.end();
                                    writeStream.on('error', err => reject(err));
                                    writeStream.on('finish', function () {
                                        fn.update(loancard, {filename: file})
                                        .then(result => {
                                            fn.settings.get('Print loancard')
                                            .then(settings => {
                                                if (settings.length !== 1 ||settings[0].value !== '1') resolve(file)
                                                else {
                                                    fn.print_pdf(`${process.env.ROOT}/public/res/loancards/${file}`)
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
    fn.loancards.cancel    = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(options.loancard_id)
            .then(loancard => {
                if      (loancard.status === 0) reject(new Error('This loancard has already been cancelled'))
                else if (loancard.status === 2) reject(new Error('This loancard has already been completed'))
                else if (loancard.status === 3) reject(new Error('This loancard has already been closed'))
                else if (loancard.status === 1) {
                    let catch_opts = [2, 3];
                    if (options.noForce) catch_opts.push(1);
                    m.loancard_lines.count({
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
                                    m.loancard_lines.findAll({
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
                                        Promise.allSettled(line_actions)
                                        .then(action => resolve(true))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                }));
                            Promise.all(actions)
                            .then(result => {
                                if (!result) reject(new Error('Loancard not updated'))
                                else {
                                    fn.actions.create(
                                        'LOANCARD | CANCELLED',
                                        options.user_id,
                                        [{table: 'loancards', id: loancard.loancard_id}]
                                    )
                                    .then(action => resolve(true));
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
    fn.loancards.create    = function (options = {}) {
        return new Promise((resolve, reject) => {
            m.loancards.findOrCreate({
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
    fn.loancards.complete  = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(options.loancard_id) 
            .then(loancard => {
                if (loancard.status !== 1) reject(new Error('Loancard is not in draft'))
                else {
                    m.loancard_lines.findAll({
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
                                        fn.actions.create(
                                            'LOANCARD | COMPLETED',
                                            options.user_id,
                                            [{table: 'loancard_lines', id: line.loancard_line_id}]
                                        )
                                        .then(action => resolve(true));
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
                            Promise.all(actions)
                            .then(result => {
                                fn.actions.create(
                                    'LOANCARD | COMPLETED',
                                    options.user_id,
                                    [{table: 'loancards', id: loancard.loancard_id}]
                                )
                                .then(action => resolve(true));
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
    fn.loancards.close     = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(options.loancard_id)
            .then(loancard => {
                m.loancard_lines.count({
                    where: {
                        loancard_id: loancard.loancard_id,
                        status:   {[fn.op.or]: [1, 2]}
                    }
                })
                .then(line_count => {
                    if (line_count > 0) resolve(false)
                    else {
                        fn.update(loancard, {status: 3})
                        .then(result => {
                            fn.actions.create(
                                'LOANCARD | CLOSED',
                                options.user_id,
                                [{table: 'loancards', id: loancard.loancard_id}]
                            )
                            .then(action => resolve(true));
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.loancards.lines.get = function (loancard_line_id) {
        return new Promise((resolve, reject) => {
            m.loancard_lines.findOne({
                where: {loancard_line_id: loancard_line_id},
                include: [m.loancards]
            })
            .then(line => {
                if (line) resolve(line)
                else reject(new Error('Line not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.lines.cancel = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.loancards.lines.get(options.loancard_line_id)
            .then(line => {
                if      (line.status === 0) reject(new Error('This line has already been cancelled'))
                else if (line.status === 2) reject(new Error('This line has already been completed'))
                else if (line.status === 3) reject(new Error('This line has already been returned'))
                else if (line.status === 1) {
                    fn.update(line, {status: 0})
                    .then(result => {
                        let cancel_action = null;
                        if (line.serial_id) {
                            cancel_action = new Promise((resolve, reject) => {
                                get_loancard_link('locations', line.loancard_line_id)
                                .then(link => {
                                    fn.locations.get({location_id: link.id})
                                    .then(location_id => {
                                        fn.serials.return_to_stock(line.serial_id, location_id)
                                        .then(serial => resolve({issue_ids: [serial.issue_id], links: [{table: 'serials', id: serial.serial_id}]}))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            });
                        } else {
                            cancel_action = new Promise((resolve, reject) => {
                                get_loancard_link('stocks', line.loancard_line_id)
                                .then(link => {
                                    fn.stocks.get({stock_id: link.id})
                                    .then(stock => {
                                        stock.increment(stock, {by: line.qty})
                                        .then(result => {
                                            get_loancard_links('issues', line.loancard_line_id)
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
                        cancel_action
                        .then(result => {
                            let issue_actions = [];
                            result.issue_ids.forEach(issue_id => {
                                issue_actions.push(new Promise((resolve, reject) => {
                                    fn.issues.get(issue_id)
                                    .then(issue => {
                                        fn.update(issue, {status: 2})
                                        .then(result => resolve({table: 'issues', id: issue.issue_id}))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                }));
                            });
                            Promise.allSettled(issue_actions)
                            .then(results => {
                                let issue_links = [];
                                results.filter(e => e.status === 'fulfilled').forEach(e => issue_links.push(e.value));
                                fn.actions.create(
                                    'LOANCARD LINE | CANCELLED',
                                    options.user_id,
                                    [{table: 'loancard_lines', id: line.loancard_line_id}].concat(result.links).concat(issue_links)
                                )
                                .then(result => resolve(line.loancard_id));
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
    function get_loancard_link(table, loancard_line_id) {
        return new Promise((resolve, reject) => {
            m.action_links.findOne({
                where: {
                    _table: table,
                    active: true
                },
                include: [{
                    model: m.actions,
                    where: {
                        action: {[fn.op.or]: [
                            'LOANCARD LINE | CREATED',
                            {[fn.op.startsWith]: 'LOANCARD LINE | INCREMENTED'}
                        ]}
                    },
                    include: [{
                        model: m.action_links,
                        as: 'links',
                        where: {
                            _table: 'loancard_lines',
                            id:     loancard_line_id,
                            active: true
                        }
                    }]
                }]
            })
            .then(link => resolve(link))
            .catch(err => reject(err));
        });
    };

    fn.loancards.lines.create = function(loancard_id, issue, user_id, line) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(loancard_id)
            .then(loancard => {
                fn.sizes.get(issue.size_id)
                .then(size => {
                    check_nsn(size, line)
                    .then(nsn_id => {
                        let action = null;
                        if (size.has_serials) action = add_serial(size.size_id, nsn_id, loancard.loancard_id, user_id, line)
                        else                  action = add_stock( size.size_id, nsn_id, loancard.loancard_id, user_id, line);
                        action
                        .then(qty_issued => {
                            fn.update(issue, {status: 4})
                            .then(result => resolve(true))
                            .catch(err => resolve(false));
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
    function add_serial(size_id, nsn_id, loancard_id, user_id, issue_id, line) {
        return new Promise((resolve, reject) => {
            let actions = [];
            line.serials.forEach(serial => {
                actions.push(new Promise((resolve, reject) => {
                    check_serial(size_id, serial.serial_id)
                    .then(serial => {
                        m.loancard_lines.create({
                            loancard_id: loancard_id,
                            serial_id:   serial.serial_id,
                            size_id:     size_id,
                            nsn_id:      nsn_id,
                            qty:         1,
                            user_id:     user_id
                        })
                        .then(loancard_line => {
                            fn.update(serial, {
                                issue_id:    issue_id,
                                location_id: null
                            })
                            .then(result => {
                                fn.actions.create(
                                    'LOANCARD LINE | CREATED',
                                    user_id,
                                    [
                                        {table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                        {table: 'serials',        id: serial.serial_id},
                                        {table: 'issues',         id: issue_id},
                                        ...(nsn_id ? {table: 'nsns', id: nsn_id} : {})
                                    ]
                                )
                                .then(action => resolve(true));
                            })
                            .catch(err => {
                                console.log(err);
                                resolve(false)
                            });
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                }));
            });
            Promise.allSettled(actions)
            .then(results => resolve(results.filter(e => e.status === 'fulfilled')))
            .catch(err => reject(err));
        });
    };
    function check_serial(size_id, serial_id) {
        return new Promise((resolve, reject) => {
            if (!serial_id) reject(new Error('No Serial ID submitted'))
            else {
                fn.serials.get(serial_id)
                .then(serial => {
                    if      ( serial.size_id !== size_id) reject(new Error('Serial # is not for this size'))
                    else if ( serial.issue_id)            reject(new Error('This serial is already issued'))
                    else if (!serial.location_id)         reject(new Error('This serial is not in stock'))
                    else resolve(serial);
                })
                .catch(err => reject(err));
            };
        });
    };
    function add_stock(size_id, nsn_id, loancard_id, user_id, line) {
        return new Promise((resolve, reject) => {
            check_stock(size_id, line)
            .then(stock => {
                m.loancard_lines.findOrCreate({
                    where: {
                        loancard_id: loancard_id,
                        status:      1,
                        size_id:     size_id,
                        nsn_id:      nsn_id
                    },
                    defaults: {
                        qty:     line.qty,
                        user_id: user_id,
                    }
                })
                .then(([loancard_line, created]) => {
                    stock.decrement('qty', {by: line.qty})
                    .then(result => {
                        let action = null;
                        if (created) action = new Promise(r => r(true))
                        else         action = loancard_line.increment('qty', {by: line.qty});
                        action
                        .then(result => {
                            fn.actions.create(
                                `LOANCARD LINE | ${(created ? 'CREATED' : `INCREMENTED | By ${line.qty}`)}`,
                                user_id,
                                [
                                    {table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                    {table: 'stocks',         id: stock.stock_id},
                                    {table: 'issues',         id: line.issue_id},
                                    (nsn_id ? {table: 'nsns', id: nsn_id} : {})
                                ]
                            )
                            .then(action => resolve(line.qty));
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
    function check_stock(size_id, options = {}) {
        return new Promise((resolve, reject) => {
            if (!options.stock_id) reject(new Error('No Stock ID submitted'))
            else {
                fn.stocks.get({stock_id: options.stock_id})
                .then(stock => {
                    if (stock.size_id !== size_id) reject(new Error('Stock record is not for this size'))
                    else resolve(stock);
                })
                .catch(err => reject(err));
            };
        });
    };

    function check_nsn(size, options = {}) {
        return new Promise((resolve, reject) => {
            if      (!size.has_nsns)  resolve(null)
            else if (!options.nsn_id) reject(new Error('No NSN ID submitted'))
            else {
                fn.nsns.get(options.nsn_id)
                .then(nsn => {
                    if (nsn.size_id !== size.size_id) reject(new Error('NSN is not for this size'))
                    else resolve(nsn.nsn_id);
                })
                .catch(err => reject(err));
            };
        });
    };
    
    fn.loancards.lines.return = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.loancards.lines.get(options.loancard_line_id)
            .then(line => {
                if      (line.status === 0) reject(new Error('This line has been cancelled'))
                else if (line.status === 1) reject(new Error('This line is still pending'))
                else if (line.status === 3) reject(new Error('This line has already been returned'))
                else if (line.status === 2) {
                    fn.sizes.get(line.size_id)
                    .then(size => {
                        m.locations.findOrCreate({
                            where: {location: options.location}
                        })
                        .then(([location, created]) => {
                            let return_action = null;
                            if (line.serial_id) {
                                return_action = new Promise((resolve, reject) => {
                                    fn.serials.return_to_stock(line.serial_id, location.location_id)
                                    .then(serial => resolve({issue_ids: [serial.issue_id], links: [{table: 'serials', id: serial.serial_id}]}))
                                    .catch(err => reject(err));
                                });
                            } else {
                                return_action = new Promise((resolve, reject) => {
                                    m.stocks.findOrCreate({
                                        where: {
                                            size_id:     size.size_id,
                                            location_id: location.location_id
                                        }
                                    })
                                    .then(([stock, created]) => {
                                        stock.increment('qty', {by: line.qty})
                                        .then(result => {
                                            get_loancard_links('issues', line.loancard_line_id)
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
                            return_action
                            .then(result => {
                                let update_actions = [], issue_links = [];
                                if ((options.qty < line.qty) && options.qty >= 1) {
                                    update_actions.push(new Promise((resolve, reject) => {
                                        m.loancard_lines.create({
                                            loancard_id: line.loancard_id,
                                            size_id:     line.size_id,
                                            serial_id:   line.serial_id,
                                            nsn_id:      line.nsn_id,
                                            qty:         line.qty - options.qty,
                                            status:      2,
                                            user_id:     line.user_id
                                        })
                                        .then(new_line => {
                                            fn.update(line, {qty: options.qty})
                                            .then(result => {
                                                fn.actions.create(
                                                    'LOANCARD LINE | CREATED | From partial return',
                                                    options.user_id,
                                                    [
                                                        {table: 'loancard_lines', id: line.loancard_line},
                                                        {table: 'loancard_lines', id: new_line.loancard_line}
                                                    ]
                                                )
                                                .then(result => resolve(true));
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    }));
                                };
                                result.issue_ids.forEach(issue_id => {
                                    update_actions.push(new Promise((resolve, reject) => {
                                        fn.issues.get(issue_id)
                                        .then(issue => {
                                            if      (issue.status === 0) reject(new Error('Issue is already cancelled'))
                                            else if (issue.status === 1) reject(new Error('Issue is pending approval'))
                                            else if (issue.status === 2) reject(new Error('Issue is not issued'))
                                            else if (issue.status === 3) reject(new Error('Issue is ordered but not issued'))
                                            else if (issue.status === 4) {
                                                fn.update(issue, {status: 5})
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
                                Promise.allSettled(update_actions)
                                .then(results => {
                                    if (results.filter(e => e.status === 'rejected').length > 0) console.log(results);
                                    fn.actions.create(
                                        'LOANCARD LINE | RETURNED',
                                        options.user_id,
                                        [
                                            {table: 'loancard_lines', id: line.loancard_line_id},
                                            {table: 'locations',      id: location.location_id}
                                        ].concat(issue_links).concat(result.links)
                                    )
                                    .then(result => resolve(line.loancard_id));
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
    function get_loancard_links(table, loancard_line_id) {
        return new Promise((resolve, reject) => {
            m.action_links.findAll({
                where: {
                    _table: table,
                    active: true
                },
                include: [{
                    model: m.actions,
                    where: {action: 
                        {[fn.op.or]: [
                            'LOANCARD LINE | CREATED',
                            {[fn.op.startsWith]: 'LOANCARD LINE | INCREMENTED'}
                        ]}
                    },
                    include: [{
                        model: m.action_links,
                        as: 'links',
                        where: {
                            _table: 'loancard_lines',
                            id:     loancard_line_id,
                            active: true
                        }
                    }]
                }]
            })
            .then(link => {
                if (!link) reject(new Error(`No link found for ${table}`))
                else resolve(link)
            })
            .catch(err => reject(err));
        });
    };
};