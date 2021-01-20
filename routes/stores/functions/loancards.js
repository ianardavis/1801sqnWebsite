module.exports = function (m, inc, loancard) {
    loancard.createPDF  = function (loancard_id) {
        return new Promise((resolve, reject) => {
            m.stores.loancards.findOne({
                where: {loancard_id: loancard_id},
                include: [
                    inc.users({as: 'user_loancard'}),
                    inc.users({as: 'user'}),
                    inc.loancard_lines({include: [
                        inc.nsns({as: 'nsn'}),
                        inc.serials({as: 'serial'}),
                        inc.sizes()
                    ]})
                ]
            })
            .then(loancard => {
                if (!loancard) reject(new Error('Loancard not found'))
                else {
                    return createFile(loancard)
                    .then(([doc, file, writeStream]) => {
                        addPage(doc, loancard)
                        let y = 250;
                        loancard.lines.forEach(line => {
                            if (y >= 761.89) {
                                doc.text('END OF PAGE', 268, y);
                                addPage(doc, loancard);
                                y = 250;
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
                            doc.moveTo(28, y).lineTo(567.28, y).stroke();
                        });
                        addDeclaration(doc, loancard.lines.length, y);
                        addPageNumbers(doc, loancard.loancard_id);
                        doc.end();
                        writeStream.on('finish', function () {
                            m.stores.loancards.update(
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
                let file        = `loancards/${loancard.loancard_id} - ${loancard.user_loancard._name}.pdf`,
                    writeStream = fs.createWriteStream(`${process.env.ROOT}/public/res/${file}`),
                    docMetadata = {};
                docMetadata.Title         = `Loan Card: ${loancard.loancard_id}`;
                docMetadata.Author        = `${loancard.user.rank._rank} ${loancard.user.full_name}`;
                docMetadata.bufferPages   = true;
                docMetadata.autoFirstPage = false;
                const doc = new PDF(docMetadata);
                doc.pipe(writeStream);
                doc.font(`${process.env.ROOT}/public/lib/fonts/myriad-pro/d (1).woff`);
                resolve([doc, file, writeStream]);
            } catch (err) {
                reject(err);
            };
        });
    };
    function addPage(doc, loancard) {
        let pageMetaData = {};
        pageMetaData.size    = 'A4';
        pageMetaData.margins = 28;
        doc
        .addPage(pageMetaData)
        .image(`${process.env.ROOT}/public/img/rafac_logo.png`, 28, 48, {fit: [112, 168]})
        .image(`${process.env.ROOT}/public/img/sqnCrest.png`, 470.25, 48, {height: 100})
        .fontSize(30)
        .text('1801 SQUADRON ATC', 154.12, 48, {align: 'justify'})
        .text('STORES LOAN CARD',  163.89, 98, {align: 'justify'})
        .moveTo(28, 170).lineTo(567.28, 170).stroke()
        .fontSize(15)
        .text(`Rank: ${loancard.user_loancard.rank._rank}`, 28, 175)
        .text(`Surname: ${loancard.user_loancard._name}`, 140, 175)
        .text(`Initials: ${loancard.user_loancard._ini}`, 415, 175)
        .text(`Bader/Service #: ${loancard.user_loancard._bader}`, 28, 195)
        .text(`Date: ${new Date(loancard.createdAt).toDateString()}`, 415, 195)
        .moveTo(28, 220).lineTo(567.28, 220).stroke()
        .fontSize(10)
        .text('Item',         28, 225)
        .text('Qty',         320, 225)
        .text('Return Date', 350, 225)
        .text('Signature',   450, 225)
        .moveTo(28, 245).lineTo(567.28, 245).stroke();
    };
    function addDeclaration(doc, count, y) {
        let close_text = `END OF LOANCARD, ${count} LINES ISSUED`,
            disclaimer = 'By signing below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
        doc
        .text(close_text, 297.64 - (doc.widthOfString(close_text) / 2), y)
        .moveTo(315, 220).lineTo(315, y).stroke()
        .moveTo(345, 220).lineTo(345, y).stroke()
        .moveTo(445, 220).lineTo(445, y).stroke();
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

    loancard.create     = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.loancards.findOrCreate({
                where: {
                    user_id_loancard: options.user_id_loancard,
                    _status:          1
                },
                defaults: {
                    user_id:   options.user_id,
                    _date_due: options._date_due || Date.now()
                }
            })
            .then(([loancard, created]) => resolve({success: true, loancard_id: loancard.loancard_id, created: created}))
            .catch(err => reject(err));
        });
    };
    loancard.createLine = function(line = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.loancards.findOne({
                where: {loancard_id: line.loancard_id},
                attributes: ['loancard_id', '_status']
            })
            .then(loancard => {
                if (!loancard) reject(new Error('Loancard not found'))
                else {
                    let include = [];
                    if (line.nsn_id)    include.push(inc.nsns(   {where: {nsn_id:    line.nsn_id},    attributes: ['nsn_id']}));
                    if (line.serial_id) include.push(inc.serials({where: {serial_id: line.serial_id}, attributes: ['serial_id']}))
                    return m.stores.sizes.findOne({
                        where:      {size_id: line.size_id},
                        attributes: ['size_id', '_serials', '_nsns'],
                        include: include
                    })
                    .then(size => {
                        if      (!size)                             reject(new Error('Size not found'))
                        else if (size._nsns    && !line.nsn_id)     reject(new Error('NSN not specified'))
                        else if (size._nsns    && !size.nsns[0])    reject(new Error('NSN not found'))
                        else if (size._serials && !line.serial_id)  reject(new Error('Serial # not specified'))
                        else if (size._serials && !size.serials[0]) reject(new Error('Serial # not found'))
                        else {
                            if (size._serials) {
                                return m.stores.loancard_lines.create({
                                    loancard_id: loancard.loancard_id,
                                    serial_id:   size.serials[0].serial_id,
                                    size_id:     size.size_id,
                                    nsn_id:      size.nsns[0].nsn_id || null,
                                    _qty:        1,
                                    user_id:     line.user_id
                                })
                                .then(loancard_line => resolve({success: true, message: 'Line added to loancard', line_id: loancard_line.line_id}))
                                .catch(err =>          reject(err));
                            } else {
                                return m.stores.loancard_lines.findOrCreate({
                                    where: {
                                        loancard_id: loancard.loancard_id,
                                        _status:     1,
                                        size_id:     size.size_id,
                                        nsn_id:      size.nsns[0].nsn_id
                                    },
                                    defaults: {
                                        _qty:    line._qty,
                                        user_id: line.user_id,
                                    }
                                })
                                .then(([loancard_line, created]) => {
                                    if (created) resolve({success: true, message: 'Line added to loancard', line_id: loancard_line.line_id})
                                    else {
                                        return loancard_line.increment('_qty', {by: line._qty})
                                        .then(result => resolve({success: true, message: 'Line added to existing loancard line', line_id: loancard_line.line_id}))
                                        .catch(err => reject(err));
                                    };
                                })
                                .catch(err => reject(err));
                            };
                        };
                    })
                    .catch(err => reject(err))
                };
            })
            .catch(err => reject(err));
        })
    };
};