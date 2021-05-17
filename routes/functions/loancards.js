module.exports = function (m, inc, fn) {
    fn.loancards = {lines: {}};
    fn.loancards.createPDF = function (loancard_id) {
        return new Promise((resolve, reject) => {
            m.loancards.findOne({
                attributes: ['loancard_id', 'status', 'createdAt'],
                where:      {loancard_id: loancard_id},
                include: [
                    inc.users({as: 'user_loancard'}),
                    inc.users({as: 'user'}),
                    inc.loancard_lines({
                        where: {status: 2},
                        include: [
                            inc.serials({as: 'serial'}),
                            inc.nsns(   {as: 'nsn'}),
                            inc.sizes()
                        ]
                    })
                ]
            })
            .then(loancard => {
                if      (!loancard)              reject(new Error('Loancard not found'))
                else if (loancard._status !== 2) reject(new Error('This loancard is not complete'))
                else if (!loancard.lines)        reject(new Error('No open lines on this loancard'))
                else {
                    return createFile(loancard)
                    .then(([doc, file, writeStream]) => {
                        addPage(doc);
                        addLogos(doc);
                        addHeader(doc, loancard);
                        let y = 225;
                        loancard.lines.forEach(line => {
                            let y_0 = y;
                            if (y >= 761.89) {
                                doc.text('END OF PAGE', 268, y);
                                addPage(doc);
                                addHeader(doc, loancard, 0);
                                y = 85;
                            };
                            doc.text(line._qty,                  320, y);
                            doc.text(line.size.item._description, 28, y);
                            y += 15;
                            doc.text(`${line.size.item._size_text}: ${line.size._size}`, 28, y);
                            if (line.nsn) {
                                y += 15;
                                doc.text(`NSN: ${String(line.nsn.group._code).padStart(2, '0')}${String(line.nsn.classification._code).padStart(2, '0')}-${String(line.nsn.country._code).padStart(2, '0')}-${line.nsn._item_number}`, 28, y);
                            };
                            if (line.serial) {
                                y += 15;
                                doc.text(`Serial #: ${line.serial._serial}`, 28, y);
                            };
                            y += 15;
                            doc
                            .moveTo(28, y).lineTo(567.28, y).stroke()
                            .moveTo(315, y_0).lineTo(315, y).stroke()
                            .moveTo(345, y_0).lineTo(345, y).stroke()
                            .moveTo(445, y_0).lineTo(445, y).stroke();
                        });
                        addDeclaration(doc, loancard.lines.length, y);
                        addPageNumbers(doc, loancard.loancard_id);
                        doc.end();
                        writeStream.on('error', err => reject(err));
                        writeStream.on('finish', function () {
                            m.loancards.update(
                                {_filename: file},
                                {where: {loancard_id: loancard.loancard_id}}
                            )
                            .then(result => resolve(file))
                            .catch(err => reject(err));
                        });
                    })
                    .catch(err => reject(err));
                }
            })
            .catch(err => reject(err));
        })
    };
    function createFile(loancard) {
        return new Promise((resolve, reject) => {
            try {
                const fs  = require('fs'),
                      PDF = require('pdfkit');
                try {
                    let file        = `${loancard.loancard_id} - ${loancard.user_loancard.name}.pdf`,
                        docMetadata = {},
                        writeStream = fs.createWriteStream(`${process.env.ROOT}/public/res/loancards/${file}`, {flags: 'wx'});
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
        .text(`Surname: ${loancard.user_loancard.name}`,              140, offset + 20)
        .text(`First Name: ${loancard.user_loancard.first_name}`,     415, offset + 20)
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
            disclaimer = 'By signing below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
        doc.text(close_text, 297.64 - (doc.widthOfString(close_text) / 2), y);
        y += 20;
        doc
        .text(disclaimer, 28, y, {width: 539.28, align: 'center'})
        .rect(197.64, y += 60, 200, 100).stroke();
    };
    function addPageNumbers(doc, loancard_id) {
        const range = doc.bufferedPageRange();
        doc.fontSize(15);
        for (let i = range.start; i < range.count; i++) {
            doc
            .switchToPage(i);
            doc
            .text(`Page ${i + 1} of ${range.count}`, 28, 803.89)
            .text(`Loancard ID: ${loancard_id}`, (567.28 - doc.widthOfString(`Loancard ID: ${loancard_id}`)), 803.89)
            .text(`Page ${i + 1} of ${range.count}`, 28, 28)
            .text(`Loancard ID: ${loancard_id}`, (567.28 - doc.widthOfString(`Loancard ID: ${loancard_id}`)), 28);
        };
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
                    date_due: options.date_due || Date.now()
                }
            })
            .then(([loancard, created]) => resolve(loancard.loancard_id))
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
                    .then(result => resolve({
                        serial_id:        serial.serial_id,
                        loancard_line_id: loancard_line.loancard_line_id
                    }))
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
                            resolve({
                                stock_id: stock.stock_id,
                                loancard_line_id: loancard_line.loancard_line_id
                            });
                        }else {
                            return loancard_line.increment('qty', {by: options.qty})
                            .then(result => {
                                resolve({
                                    stock_id:         stock.stock_id,
                                    loancard_line_id: loancard_line.loancard_line_id
                                });
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
    fn.loancards.lines.create = function(options = {}) {
        return new Promise((resolve, reject) => {
            return m.issues.findOne({where: {issue_id: options.issue_id}})
            .then(issue => {
                return m.loancards.findOne({
                    where:      {loancard_id: options.loancard_id},
                    attributes: ['loancard_id', 'status']
                })
                .then(loancard => {
                    if (!loancard) reject(new Error('Loancard not found'))
                    else {
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
                                            return m.actions.create({
                                                action:   'Issue added to loancard',
                                                user_id:  options.user_id,
                                                issue_id: issue.issue_id,
                                                nsn_id:   nsn_id,
                                                ...action_details
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
                        .catch(err => reject(err))
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
    };
};