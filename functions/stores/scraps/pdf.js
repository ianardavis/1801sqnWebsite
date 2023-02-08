module.exports = function (m, fn) {
    function check_scrap(scrap_id, user) {
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
                    reject(new Error('This scrap is not complete'));

                } else if (!scrap.lines || scrap.lines.length === 0) {
                    reject(new Error('No open lines on this scrap'));

                } else {
                    resolve([scrap, user]);

                };
            })
            .catch(err => reject(err));
        });
    };
    function create_pdf([scrap, user]) {
        return new Promise((resolve, reject) => {
            fn.pdfs.create_barcodes(scrap.scrap_id)
            .then(result => {
                fn.pdfs.create(scrap.scrap_id, 'scraps', 'scrap', user)
                .then(([doc, file, writeStream]) => {
                    let y = fn.pdfs.new_page(doc);
                    y += add_header(doc, y, true);
                    resolve([scrap, doc, file, writeStream, y]);
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function add_header(doc, y, logos = false) {
        if (logos) {
            y += fn.pdfs.logos(doc, y, 'SCRAPPED STOCK');
        };
        doc
            .fontSize(10)
            .text('Item', 161, y)
            .text('Qty',  230, y)
            .text('NSN',  320, y);
            //Horizontal Lines
        draw_line(doc, [28, y],    [567, y]);
        draw_line(doc, [28, y+15], [567, y+15]);
            //Vertical Lines
        draw_line(doc, [200, y],    [200, y+15]);
        draw_line(doc, [280, y],    [280, y+15]);
        return 15;
    };
    function add_line(doc, line, y) {
        let y_c = 30;
        doc
            .text(line.qty,                                                            230, y)
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
        draw_line(doc, [28,  y+y_c], [567, y+y_c]);
        draw_line(doc, [315, y],     [315, y+y_c]);
        draw_line(doc, [345, y],     [345, y+y_c]);
        draw_line(doc, [445, y],     [445, y+y_c]);
        return y_c;
    };
    function draw_line(doc, from, to) {
        doc.moveTo(...from).lineTo(...to).stroke()
    };
    function add_barcode(doc, nsn, location) {
        return new Promise((resolve, reject) => {
            fn.pdfs.create_barcodes(fn.print_nsn(nsn, ''))
            .then(([file_128, file_qr]) => {
                doc.image(file_128,  ...location, {width: 300,  height: 75});
                resolve(true);
            })
            .catch(err => reject(err));
        });
    };
    function add_lines([scrap, doc, file, writeStream, y]) {
        return new Promise(resolve => {
            let print_nsn_barcodes = []; 
            scrap.lines.forEach(line => {
                if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                    y = fn.pdfs.end_of_page(doc, y);
                    y += add_header(doc, y);
                    
                };
                y += add_line(doc, line, y);
                if (line.nsn) {
                    print_nsn_barcodes.push(
                        add_barcode(doc, line.nsn, [290, y])
                    );
                };
            });
            Promise.all(print_nsn_barcodes)
            .then(result => resolve([doc, scrap, writeStream, file]))
            .catch(err => reject(err));
        });
    };
    function finalise_pdf([doc, scrap, writeStream, file]) {
        return new Promise((resolve, reject) => {
            writeStream.on('error', err => reject(err));
            writeStream.on('finish', function () {
                resolve([scrap, file]);
            });

            fn.pdfs.page_numbers(doc, scrap.scrap_id);
            doc.end(); 
        });
    };
    function update_scrap(scrap, filename) {
        return new Promise((resolve, reject) => {
            scrap.update({filename: filename})
            .then(result => resolve(filename))
            .catch(err => reject(err))
        });
    };
    function print_pdf(filename) {
        return new Promise(resolve => {
            fn.settings.get('Print scrap')
            .then(settings => {
                if (settings.length !== 1 || settings[0].value !== '1') {
                    resolve(filename);

                } else {
                    fn.pdfs.print('scraps', file)
                    .then(result => resolve(filename))
                    .catch(err => {
                        console.log(err);
                        resolve(filename);
                    });

                };
            })
            .catch(err => {
                console.log(err);
                resolve(filename)
            });
        });
    };
    fn.scraps.pdf.create = function (scrap_id, user) {
        return new Promise((resolve, reject) => {
            check_scrap(scrap_id, user)
            .then(create_pdf)
            .then(add_lines)
            .then(finalise_pdf)
            .then(update_scrap)
            .then(print_pdf)
            .then(filename => resolve(filename))
            .catch(err => reject(err));
        });
    };
};