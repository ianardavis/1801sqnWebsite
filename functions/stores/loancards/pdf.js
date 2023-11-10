module.exports = function (m, fn) {
    // string height @ 30: 38.19
    // string height @ 15: 19.095
    // string height @ 10: 12.7299999
    // A4 (595.28 x 841.89)

    fn.loancards.pdf.create = function (loancard_id) {
        function check(loancard_id) {
            return new Promise((resolve, reject) => {
                fn.loancards.find(
                    {loancard_id: loancard_id},
                    [{
                        model: m.loancard_lines,
                        as: 'lines',
                        where: {status: 2},
                        required: false,
                        include: [
                            m.issues,
                            fn.inc.stores.serial(),
                            fn.inc.stores.nsn(),
                            fn.inc.stores.size()
                        ]
                    }]
                )
                .then(loancard => {
                    if (loancard.status !== 2) {
                        reject(new Error('This loancard is not complete'));
    
                    } else if (!loancard.lines || loancard.lines.length === 0) {
                        reject(new Error('No open lines on this loancard'));
    
                    } else {
                        resolve(loancard);
    
                    };
                })
                .catch(reject);
            });
        };
        function createPDF(loancard) {
            return new Promise((resolve, reject) => {
                fn.pdfs.createBarcodes(loancard.loancard_id)
                .then(result => {
                    fn.pdfs.create(
                        loancard.loancard_id,
                        'loancards',
                        loancard.user_loancard.surname,
                        loancard.user
                    )
                    .then(([doc, filename, writeStream]) => {
                        let y = fn.pdfs.newPage(doc);
                        y += fn.pdfs.logos(doc, y, 'STORES LOAN CARD');
                        y += addHeader(doc, loancard, y);
                        resolve([loancard, doc, filename, writeStream, y]);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        };
        function addLines([loancard, doc, filename, writeStream, y]) {
            function addLine(doc, line, y) {
                let y_c = 30;
                let qty = 0;
                line.issues.forEach(issue => {qty += issue.qty});
                doc
                    .text(qty,                                                                 320, y)
                    .text(line.size.item.description,                                           28, y)
                    .text(`${fn.printSizeText(line.size.item)}: ${fn.printSize(line.size)}`, 28, y+15);
                if (line.nsn) {
                    doc.text(`NSN: ${fn.printNSN(line.nsn)}`,  28, y+y_c);
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
            return new Promise(resolve => {
                loancard.lines.forEach(line => {
                    if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                        y = fn.pdfs.endOfPage(doc, y);
                        y += addHeader(doc, loancard, y);
                    };
                    y += addLine(doc, line, y);
                });
                resolve([loancard, doc, filename, writeStream, y])
            });
        };
        function finaliseLoancard([loancard, doc, filename, writeStream, y]) {
            function addDeclaration(doc, count, y) {
                if (y >= 640) y = fn.pdfs.endOfPage(doc, y);
                const close_text = `END OF LOANCARD, ${count} LINE(S) ISSUED`;
                const disclaimer = 'By signing in the box below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
                doc
                .text(close_text, 28, y,    {width: 539, align: 'center'})
                .text(disclaimer, 28, y+20, {width: 539, align: 'center'})
                .rect(197.64, y+50, 200, 100).stroke();
            };

            addDeclaration(doc, loancard.lines.length, y);
            fn.pdfs.pageNumbers(doc, loancard.loancard_id);
            doc.end();
            
            writeStream.on('error', err => reject(err));
            writeStream.on('finish', function () {
                resolve([loancard, filename]);
            });
        };
        function updateLoancard([loancard, filename]) {
            return new Promise((resolve, reject) => {
                fn.update(loancard, {filename: filename})
                .then(result => resolve(filename))
                .catch(reject);
            });
        };
        function printLoancard(filename) {
            return new Promise(resolve => {
                fn.settings.find({name: 'Print loancard'})
                .then(setting => {
                    if (setting.value === '1') {
                        fn.pdfs.print('loancards', filename)
                        .then(result => resolve(filename))
                        .catch(err => {
                            console.error(err);
                            resolve(filename);
                        });
    
                    } else {
                        resolve(filename);
                        
                    };
                })
                .catch(err => {
                    console.error(err);
                    resolve(filename)
                });
            });
        };
        
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

        return new Promise((resolve, reject) => {
            check(loancard_id)
            .then(createPDF)
            .then(addLines)
            .then(finaliseLoancard)
            .then(updateLoancard)
            .then(printLoancard)
            .then(resolve)
            .catch(reject);
        })
    };
};