module.exports = function (m, fn) {
    const x_0 = 28;
    const x_1 = 140;
    const x_2 = 170;
    const x_3 = 567;

    fn.scraps.pdf.create = function (scrap_id, user) {
        function check(scrap_id, user) {
            return new Promise((resolve, reject) => {
                m.scraps.findOne({
                    where: {scrap_id: scrap_id},
                    include: [
                        {
                            model: m.scrap_lines,
                            as: 'lines',
                            where: {status: 2},
                            required: false,
                            include: [
                                fn.inc.stores.nsn(),
                                fn.inc.stores.size()
                            ]
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
                .catch(reject);
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
                        resolve([scrap, doc, file, writeStream, y-13]);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        };
        function add_lines([scrap, doc, file, writeStream, y]) {
            function add_line(doc, line, y) {
                let y_c = 30;
                centre_text(doc, line.qty, x_1, x_2, y+15);
                doc .text(line.size.item.description,                                           x_0, y)
                    .text(`${fn.print_size_text(line.size.item)}: ${fn.print_size(line.size)}`, x_0, y+15);
                if (line.nsn) {
                    doc.text(`NSN: ${fn.print_nsn(line.nsn)}`,  x_0, y+y_c);
                    y_c += 15;
                };
                if (line.serial) {
                    doc.text(`Serial #: ${line.serial.serial}`, x_0, y+y_c);
                    y_c += 15;
                };
                // Line below
                draw_line(doc, [x_0, y+60], [x_3, y+60]);
                // Verticals
                draw_line(doc, [x_1, y],    [x_1, y+60]);
                draw_line(doc, [x_2, y],    [x_2, y+60]);
                return 60;
            };
            function add_barcode(doc, nsn, location) {
                return new Promise((resolve, reject) => {
                    fn.pdfs.create_barcode(
                        fn.print_nsn(nsn, ''),
                        'code128',
                        {
                            includetext: true,
                            height: 50/2.835,
                            textsize: 15
                        }
                    )
                    .then(file => {
                        doc.image(file, ...location, {fit: [x_3-x_2-20, 50], align: 'center'});
                        resolve(true);
                    })
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                let print_nsn_barcodes = []; 
                scrap.lines.forEach(line => {
                    if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                        y = fn.pdfs.end_of_page(doc, y);
                        y += add_header(doc, y);
                        
                    };
                    if (line.nsn) {
                        print_nsn_barcodes.push(
                            add_barcode(doc, line.nsn, [x_2+10, y+5])
                        );
                    };
                    y += add_line(doc, line, y);
                });
                Promise.all(print_nsn_barcodes)
                .then(result => resolve([doc, scrap, writeStream, file]))
                .catch(reject);
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
        function update_scrap([scrap, filename]) {
            return new Promise((resolve, reject) => {
                fn.update(scrap, {filename: filename})
                .then(result => resolve(filename))
                .catch(reject);
            });
        };
        function print_pdf(filename) {
            return new Promise(resolve => {
                fn.settings.get({name: 'Print scrap'})
                .then(setting => {
                    if (setting.value === '1') {
                        fn.pdfs.print('scraps', file)
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
        
        function add_header(doc, y, logos = false) {
            if (logos) {
                y += fn.pdfs.logos(doc, y, 'SCRAPPED STOCK');
            };
            doc.fontSize(10);
            centre_text(doc, 'Item', x_0, x_1, y);
            centre_text(doc, 'Qty',  x_1, x_2, y);
            centre_text(doc, 'NSN',  x_2, x_3, y);
                //Horizontal Lines
            draw_line(doc, [x_0, y],    [x_3, y]);
            draw_line(doc, [x_0, y+15], [x_3, y+15]);
                //Vertical Lines
            draw_line(doc, [x_1, y],    [x_1, y+15]);
            draw_line(doc, [x_2, y],    [x_2, y+15]);
            return y;
        };
        function draw_line(doc, from, to) {
            doc.moveTo(...from).lineTo(...to).stroke()
        };
        function centre_text(doc, text, column_start, column_end, y) {
            if (typeof text !== 'string') text = text.toString();
            const string_length = doc.widthOfString(text);
            const x = (((column_end-column_start)-string_length)/2)+column_start;
            doc.text(text, x, y);
        };
        return new Promise((resolve, reject) => {
            check(scrap_id, user)
            .then(create_pdf)
            .then(add_lines)
            .then(finalise_pdf)
            .then(update_scrap)
            .then(print_pdf)
            .then(filename => resolve(filename))
            .catch(reject);
        });
    };
};