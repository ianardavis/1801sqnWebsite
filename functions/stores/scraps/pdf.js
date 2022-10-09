module.exports = function (m, fn) {
    function add_header(doc, y) {
        doc
            .fontSize(10)
            .text('Item', 161, y)
            .text('Qty',  320, y)
            //Horizontal Lines
            .moveTo( 28, y)   .lineTo(567, y)   .stroke()
            .moveTo( 28, y)   .lineTo(567, y)   .stroke()
            .moveTo( 28, y+15).lineTo(567, y+15).stroke()
            //Vertical Lines
            .moveTo(315, y)   .lineTo(315, y+15).stroke()
            .moveTo(345, y)   .lineTo(345, y+15).stroke()
            .moveTo(445, y)   .lineTo(445, y+15).stroke();
        return 15;
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
    function create_pdf(scrap, user) {
        return new Promise((resolve, reject) => {
            fn.pdfs.create_barcodes(scrap.scrap_id)
            .then(result => {
                fn.pdfs.create(scrap.scrap_id, 'scraps', 'scrap', user)
                .then(([doc, file, writeStream]) => {
                    let y = fn.pdfs.new_page(doc);
                    y += fn.pdfs.logos(doc, y, 'SCRAPPED STOCK');
                    y += add_header(doc, y);
                    scrap.lines.forEach(line => {
                        if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                            y = fn.pdfs.end_of_page(doc, y);
                            y += add_header(doc, y);
                        };
                        y += add_line(doc, line, y);
                    });
                    fn.pdfs.page_numbers(doc, scrap.scrap_id);
                    doc.end();

                    writeStream.on('error', err => reject(err));

                    writeStream.on('finish', function () {
                        fn.settings.get('Print scrap')
                        .then(settings => {
                            if (settings.length !== 1 || settings[0].value !== '1') {
                                resolve(file);
                            } else {
                                fn.pdfs.print('scraps', file)
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
                    });

                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.scraps.pdf.create = function (scrap_id, user) {
        return new Promise((resolve, reject) => {
            m.scraps.findOne({
                where: {scrap_id: scrap_id},
                include: [
                    {
                        model: m.scrap_lines,
                        as: 'lines',
                        where: {status: 2},
                        required: false
                    }
                ]
            })
            .then(scrap => {
                if (scrap.status !== 2) {
                    reject(new Error('This scrap is not complete'))
                } else if (!scrap.lines || scrap.lines.length === 0) {
                    reject(new Error('No open lines on this scrap'))
                } else {
                    create_pdf(scrap, user)
                    .then(filename => {
                        scrap.update({filename: filename})
                        .then(result => resolve(filename))
                        .catch(err => reject(err));
                    })
                    .catch(err => {
                        console.log(err);
                        reject(false);
                    });
                };
            })
            .catch(err => reject(err));
        })
    };
};