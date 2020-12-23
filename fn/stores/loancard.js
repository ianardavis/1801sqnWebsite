module.exports = function (m, loancard) {
    loancard.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            m.issues.findOne({
                where: {issue_id: options.issue_id},
                include: [
                    inc.users({as: '_to'}),
                    inc.users({as: '_by'}),
                    inc.issue_lines({include: [
                        inc.nsns(),
                        inc.serials(),
                        inc.stock({size: true})
                    ]})
                ]
            })
            .then(issue => {
                if (issue) {
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
                        let pageMetaData = {};
                        pageMetaData.size    = 'A4';
                        pageMetaData.margins = 28;
                        doc.addPage(pageMetaData); 
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
                        doc
                            .fontSize(10)
                            .text('NSN', 28, 225)
                            .text('Description', 123.81, 225)
                            .text('Size', 276.31, 225)
                            .text('Qty', 373.56, 225)
                            .text('Return Date', 404.21, 225)
                            .text('Signature', 499.745, 225)
                            .moveTo(28, 245).lineTo(567.28, 245).stroke();
                            try {
                                let y = 250;
                                issue.lines.forEach(line => {
                                    if (y >= 761.89) {
                                        doc.text('END OF PAGE', 268, y)
                                        let pageMetaData = {};
                                        pageMetaData.size    = 'A4';
                                        pageMetaData.margins = 28;
                                        doc.addPage(pageMetaData);
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
                            const range = doc.bufferedPageRange();
                        doc.fontSize(15);
                        for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                            doc.switchToPage(i);
                            doc
                            .text(`Page ${i + 1} of ${range.count}`, 28, 803.89)
                            .text('Issue ID: ' + issue.issue_id, (567.28 - doc.widthOfString('Issue ID: ' + issue.issue_id)), 803.89)
                            .text(`Page ${i + 1} of ${range.count}`, 28, 28)
                            .text('Issue ID: ' + issue.issue_id, (567.28 - doc.widthOfString('Issue ID: ' + issue.issue_id)), 28);
                        }
                        addPageNumbers(doc, issue.issue_id);
                        doc.end();
                        writeStream.on('finish', () => {
                            fn.update(
                                m.issues,
                                { _filename: file },
                                { issue_id: issue.issue_id}
                            )
                            .then(result => resolve(file))
                            .catch(err => reject(err));
                        });
                    } catch (err) {
                        reject(err)
                    };
                } else reject(new Error('Issue not found'))
            })
            .catch(err => reject(err));
        })
    }
};