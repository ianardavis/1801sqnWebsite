module.exports = function (m, fn) {
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
        if (y >= 640) y = fn.pdfs.end_of_page(doc, y);
        const close_text = `END OF LOANCARD, ${count} LINE(S) ISSUED`;
        const disclaimer = 'By signing in the box below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
        doc
        .text(close_text, 28, y,    {width: 539, align: 'center'})
        .text(disclaimer, 28, y+20, {width: 539, align: 'center'})
        .rect(197.64, y+50, 200, 100).stroke();
    };
    function addLine(doc, line, y) {
        let y_c = 30;
        let qty = 0;
        line.issues.forEach(issue => {qty += issue.qty});
        doc
            .text(qty,                                                                 320, y)
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

    function create_pdf_check(loancard_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.get(
                loancard_id,
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
            .catch(err => reject(err));
        });
    };
    fn.loancards.pdf.create = function (loancard_id) {
        return new Promise((resolve, reject) => {
            create_pdf_check(loancard_id)
            .then(loancard => {
                fn.pdfs.create_barcodes(loancard.loancard_id)
                .then(result => {
                    fn.pdfs.create(
                        loancard.loancard_id,
                        'loancards',
                        loancard.user_loancard.surname,
                        loancard.user
                    )
                    .then(([doc, file, writeStream]) => {
                        let y = fn.pdfs.new_page(doc);
                        y += fn.pdfs.logos(doc, y, 'STORES LOAN CARD');
                        y += addHeader(doc, loancard, y);
                        loancard.lines.forEach(line => {
                            if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                                y = fn.pdfs.end_of_page(doc, y);
                                y += addHeader(doc, loancard, y);
                            };
                            y += addLine(doc, line, y);
                        });
                        addDeclaration(doc, loancard.lines.length, y);
                        fn.pdfs.page_numbers(doc, loancard.loancard_id);
                        doc.end();
                        writeStream.on('error', err => reject(err));
                        writeStream.on('finish', function () {
                            loancard.update({filename: file})
                            .then(result => {
                                fn.settings.get('Print loancard')
                                .then(settings => {
                                    if (settings.length !== 1 ||settings[0].value !== '1') {
                                        resolve(file);

                                    } else {
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
            })
            .catch(err => reject(err));
        })
    };
};