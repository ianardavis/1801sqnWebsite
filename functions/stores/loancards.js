module.exports = function (m, fn) {
    fn.loancards = {lines: {}};
    fn.loancards.get = function (loancard_id, includes = []) {
        return new Promise((resolve, reject) => {
            m.loancards.findOne({
                where: {loancard_id: loancard_id},
                include: [
                    fn.inc.users.user(),
                    fn.inc.users.user({as: 'user_loancard'})
                ].concat(includes)
            })
            .then(loancard => {
                if (loancard) {
                    resolve(loancard);
                } else {
                    reject(new Error('Loancard not found'));
                };
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
    // string height @ 30: 38.19
    // string height @ 15: 19.095
    // string height @ 10: 12.7299999
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
        if (y >= 640) fn.pdfs.end_of_page(doc, y);
        const close_text = `END OF LOANCARD, ${count} LINE(S) ISSUED`;
        const disclaimer = 'By signing in the box below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
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
                            fn.pdfs.create_barcodes(loancard.loancard_id)
                            .then(result => {
                                fn.pdfs.create(loancard.loancard_id, 'loancards', loancard.user_loancard.surname, loancard.user)
                                .then(([doc, file, writeStream]) => {
                                    let y = fn.pdfs.new_page(doc);
                                    y += fn.pdfs.logos(doc, y, 'STORES LOAN CARD');
                                    y += addHeader(doc, loancard, y);
                                    lines.forEach(line => {
                                        if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                                            y = fn.pdfs.end_of_page(doc, y);
                                            y += addHeader(doc, loancard, y);
                                        };
                                        y += addLine(doc, line, y);
                                    });
                                    addDeclaration(doc, lines.length, y);
                                    fn.pdfs.page_numbers(doc, loancard.loancard_id);
                                    doc.end();
                                    writeStream.on('error', err => reject(err));
                                    writeStream.on('finish', function () {
                                        loancard.update({filename: file})
                                        .then(result => {
                                            fn.settings.get('Print loancard')
                                            .then(settings => {
                                                if (settings.length !== 1 ||settings[0].value !== '1') resolve(file)
                                                else {
                                                    fn.pdfs.print('loancards', file)
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
    function cancel_loancard_check(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(
                options.loancard_id,
                [{
                    model: m.loancard_lines,
                    as: 'lines',
                    where: {status: {[fn.op.or]: [1, 2, 3]}},
                    required: false
                }]
            )
            .then(loancard => {
                if (loancard.status === 0) {
                    reject(new Error('This loancard has already been cancelled'));

                } else if (loancard.status === 1) {
                    if (loancard.lines && loancard.lines > 0) {
                        reject(new Error('You can not cancel a loancard with uncancelled lines'));

                    } else {
                        resolve(loancard);

                    };
                } else if (loancard.status === 2) {
                    reject(new Error('This loancard has already been completed'));

                } else if (loancard.status === 3) {
                    reject(new Error('This loancard has already been closed'));

                } else {
                    reject(new Error('Unknown loancard status'));
                };
            })
            .then(err => reject(err));
        });
    };
    fn.loancards.cancel    = function (options = {}) {
        return new Promise((resolve, reject) => {
            cancel_loancard_check(options.loancard_id)
            .then(loancard => {
                loancard.update({status: 0})
                .then(result => {
                    if (result) {
                        fn.actions.create(
                            'LOANCARD | CANCELLED',
                            options.user_id,
                            [{table: 'loancards', id: loancard.loancard_id}]
                        )
                        .then(action => resolve(true));

                    } else {
                        reject(new Error('Loancard not cancelled'));
                    };
                })
                .catch(err => reject(err));
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
                            actions.push(loancard.update({
                                status:   2,
                                date_due: options.date_due
                            }));
                            lines.forEach(line => {
                                actions.push(new Promise((resolve, reject) => {
                                    line.update({status: 2})
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
                        loancard.update({status: 3})
                        .then(result => {
                            if (result) {
                                fn.actions.create(
                                    'LOANCARD | CLOSED',
                                    options.user_id,
                                    [{table: 'loancards', id: loancard.loancard_id}]
                                )
                                .then(action => resolve(true));
                            } else {
                                reject(new Error('Loancard not updated'));
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

    function process_lines(lines, user_id) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.filter(e => e.status === '3').forEach(line => {
                actions.push(fn.loancards.lines.return({...line, user_id: user_id}));
            });
            lines.filter(e => e.status === '0').forEach(line => {
                actions.push(fn.loancards.lines.cancel(line, user_id));
            });
            Promise.allSettled(actions)
            .then(results => {
                let loancards = [];
                results.filter(e => e.status === 'fulfilled').forEach(e => {
                    if (!loancards.includes(e.value)) loancards.push(e.value)
                });
                resolve(loancards);
            })
            .catch(err => reject(err));
        });
    };
    function check_loancard(loancard_id) {
        return new Promise((resolve, reject) => {
            m.loancards.findOne({
                where: {loancard_id: loancard_id},
                include: [{
                    model:    m.loancard_lines,
                    as:       'lines',
                    where:    {status: {[fn.op.or]: [1, 2]}},
                    required: false
                }]
            })
            .then(loancard => {
                if (!loancard.lines || loancard.lines.length === 0) {
                    if (loancard.status === 0) {
                        resolve(false);
                    } else if (loancard.status === 1) {
                        fn.loancards.cancel({loancard_id: loancard.loancard_id, user_id: user_id, noforce: true})
                        .then(result => resolve(result))
                        .catch(err => {
                            console.log(err);
                            reject(err);
                        });
                    } else if (loancard.status === 2) {
                        fn.loancards.close({loancard_id: loancard.loancard_id, user_id: user_id})
                        .then(result => resolve(result))
                        .catch(err => {
                            console.log(err);
                            reject(err);
                        });
                    } else if (loancard.status === 3) {
                        resolve(false);
                    } else {
                        reject(new Error('Unknown loancard status'));
                    };
                } else {
                    resolve(false);
                };
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    };
    fn.loancards.lines.process = function (lines, user_id) {
        return new Promise((resolve, reject) => {
            process_lines(lines, user_id)
            .then(loancard_ids => {
                let loancard_checks = [];
                loancard_ids.forEach(loancard_id => {
                    loancard_checks.push(check_loancard(loancard_id));
                });
                Promise.allSettled(loancard_checks)
                .then(results => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.loancards.lines.get = function (loancard_line_id, includes = []) {
        return new Promise((resolve, reject) => {
            m.loancard_lines.findOne({
                where: {loancard_line_id: loancard_line_id},
                include: [m.loancards].concat(includes)
            })
            .then(line => {
                if (line) {
                    resolve(line);

                } else {
                    reject(new Error('Line not found'));

                };
            })
            .catch(err => reject(err));
        });
    };

    function cancel_line_check(line_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.lines.get(
                line_id,
                [m.issues]
            )
            .then(line => {
                if (line.status === 0) {
                    reject(new Error('This line has already been cancelled'));

                } else if (line.status === 1) {
                    resolve(line);
                    
                } else if (line.status === 2) {
                    reject(new Error('This line has already been completed'));

                } else if (line.status === 3) {
                    reject(new Error('This line has already been returned'));

                } else {
                    reject(new Error('Unknown line status'));

                };
            })
            .catch(err => reject(err));
        });
    };
    function update_issues_and_destroy_links(issues) {
        return new Promise((resolve, reject) => {
            let actions = [];
            let links = [];
            issues.forEach(issue => {
                actions.push(new Promise((resolve, reject) => {
                    issue.issue_loancard_line.destroy()
                    .then(result => {
                        if (result) {
                            issue.update({status: 2})
                            .then(result => {
                                if (result) {
                                    links.push({table: 'issues', id: issue.issue_id});
                                    resolve(issue);

                                } else {
                                    reject(new Error('Issue not updated'));

                                };
                            })
                            .catch(err => reject(err));

                        } else {
                            reject(new Error('Link not destroyed'));

                        };
                    })
                    .catch(err => reject(err));
                }));
            });
            Promise.all(actions)
            .then(resolved_issues => resolve([resolved_issues, links]))
            .catch(err => reject(err));
        });
    };
    function return_to_location(serial_id, location, issues, size_id) {
        if (serial_id) {
            return fn.serials.return(serial_id, location);

        } else {
            return new Promise((resolve, reject) => {
                const qty = issues.reduce((prev, curr) => prev.qty + curr.qty, 0);
                fn.stocks.get({size_id: size_id, location: location})
                .then(stock => {
                    fn.stocks.return(stock.stock_id, qty)
                    .then(link => resolve(link))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            });

        };
    };
    fn.loancards.lines.cancel = function (return_line, user_id) {
        return new Promise((resolve, reject) => {
            cancel_line_check(return_line.loancard_line_id)
            .then(line => {
                line.update({status: 0})
                .then(result => {
                    update_issues_and_destroy_links(line.issues)
                    .then(([issues, links]) => {
                        return_to_location(
                            line.serial_id,
                            return_line.location,
                            issues,
                            line.size_id
                        )
                        .then(link => {
                            fn.actions.create(
                                'LOANCARD LINE | CANCELLED',
                                user_id,
                                [
                                    {table: 'loancard_lines', id: line.loancard_line_id},
                                    link
                                ].concat(links)
                            )
                            .then(result => resolve(line.loancard_id));
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

    function check_nsn(size, options = {}) {
        return new Promise((resolve, reject) => {
            if (size.has_nsns) {
                if (options.nsn_id) {
                    fn.nsns.get(options.nsn_id)
                    .then(nsn => {
                        if (nsn.size_id !== size.size_id) {
                            reject(new Error('NSN is not for this size'));
                        } else {
                            resolve(nsn.nsn_id);
                        };
                    })
                    .catch(err => reject(err));
                } else {
                    reject(new Error('No NSN ID submitted'));
                };
            } else {
                resolve(null);
            };
        });
    };
    fn.loancards.lines.create = function(loancard_id, issue, user_id, line) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.loancards.get(loancard_id),
                fn.sizes.get(issue.size_id)
            ])
            .then(([loancard, size]) => {
                check_nsn(size, line)
                .then(nsn_id => {
                    let action = null;
                    const args = [size.size_id, nsn_id, loancard.loancard_id, user_id, line, issue];
                    if (size.has_serials) {
                        action = add_serial(...args);
                    } else {
                        action = add_stock(...args);
                    };
                    action
                    .then(links => {
                        if (nsn_id) links.push({table: 'nsns', id: nsn_id});
                        resolve(links);
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
    };
    function add_serial(size_id, nsn_id, loancard_id, user_id, line, issue) {
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
                            m.issue_loancard_lines.create({
                                issue_id: issue.issue_id,
                                loancard_line_id: loancard_line.loancard_line_id
                            })
                            .then(link_line => {
                                const resolve_obj = [
                                    {table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                    {table: 'serials',        id: serial.serial_id}
                                ];
                                serial.update({
                                    issue_id:    issue.issue_id,
                                    location_id: null
                                })
                                .then(result => {
                                    fn.actions.create(
                                        'LOANCARD LINE | CREATED',
                                        user_id,
                                        [{table: 'loancard_lines', id: loancard_line.loancard_line_id}]
                                    )
                                    .then(action => resolve(resolve_obj));
                                })
                                .catch(err => {
                                    console.log(err);
                                    resolve(resolve_obj)
                                });
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                }));
            });
            Promise.allSettled(actions)
            .then(results => {
                let resolve_obj = [];
                results.filter(e => e.status === 'fulfilled').forEach(r => resolve_obj.concat(r.value));
                resolve(resolve_obj);
            })
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

    function add_stock(size_id, nsn_id, loancard_id, user_id, line, issue) {
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
                    defaults: {user_id: user_id}
                })
                .then(([loancard_line, created]) => {
                    stock.decrement('qty', {by: line.qty})
                    .then(result => {
                        m.issue_loancard_lines.create({
                            issue_id: issue.issue_id,
                            loancard_line_id: loancard_line.loancard_line_id
                        })
                        .then(link_line => {
                            const resolve_obj = [
                                {table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                {table: 'stocks',         id: stock.stock_id}
                            ];
                            if (created) {
                                fn.actions.create(
                                    'LOANCARD LINE | CREATED',
                                    user_id,
                                    [{table: 'loancard_lines', id: loancard_line.loancard_line_id}]
                                )
                                .then(action => resolve(resolve_obj));
                            } else {
                                resolve(resolve_obj);
                            };
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
            if (!options.stock_id) {
                reject(new Error('No stock ID submitted'));
            } else {
                fn.stocks.get({stock_id: options.stock_id})
                .then(stock => {
                    if (stock.size_id !== size_id) {
                        reject(new Error('Stock record is not for this size'));
                    } else {
                        resolve(stock);
                    };
                })
                .catch(err => reject(err));
            };
        });
    };

    
    fn.loancards.lines.return = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.loancards.lines.get(options.loancard_line_id)
            .then(line => {
                if (line.status === 0) {
                    reject(new Error('This line has been cancelled'));

                } else if (line.status === 1) {
                    reject(new Error('This line is still pending'));

                } else if (line.status === 3) {
                    reject(new Error('This line has already been returned'));

                } else if (line.status === 2) {
                    fn.sizes.get(line.size_id)
                    .then(size => {
                        m.locations.findOrCreate({
                            where: {location: options.location}
                        })
                        .then(([location, created]) => {
                            let return_action = null;
                            if (line.serial_id) {
                                return_action = new Promise((resolve, reject) => {
                                    fn.serials.return(line.serial_id, options.location)
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
                                            line.update({qty: options.qty})
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
                                        fn.issues.get({issue_id: issue_id})
                                        .then(issue => {
                                            if      (issue.status === 0) reject(new Error('Issue is already cancelled'))
                                            else if (issue.status === 1) reject(new Error('Issue is pending approval'))
                                            else if (issue.status === 2) reject(new Error('Issue is not issued'))
                                            else if (issue.status === 3) reject(new Error('Issue is ordered but not issued'))
                                            else if (issue.status === 4) {
                                                issue.update({status: 5})
                                                .then(result => {
                                                    issue_links.push({table: 'issues', id: issue.issue_id})
                                                    resolve(true);
                                                })
                                                .catch(err => reject(err));
                                            } else reject(new Error('Unknown issue status'));
                                        })
                                    }));
                                })
                                update_actions.push(line.update({status: 3}));
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