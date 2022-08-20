module.exports = function (m, fn) {
    fn.scraps = {};
    fn.scraps.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.scrap_id) {
                m.scraps.findByPk(options.scrap_id)
                .then(scrap => resolve(scrap))
                .catch(err => reject(err));
            } else {
                m.scraps.findOrCreate({
                    where: {
                        supplier_id: options.supplier_id || null,
                        status: 1
                    }
                })
                .then(([scrap, created]) => resolve(scrap))
                .catch(err => reject(err));
            };
        });
    };
    function addHeader(doc, y) {
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
    fn.scraps.createPDF = function (scrap_id, user) {
        return new Promise((resolve, reject) => {
            m.scraps.FindOne({where: {scrap_id: scrap_id}})
            .then(scrap => {
                if (scrap.status !== 2) reject(new Error('This scrap is not complete'))
                else {
                    m.scrap_lines.findAll({
                        where: {
                            scrap_id: scrap.scrap_id,
                            status:   2
                        },
                        include: [
                            fn.inc.stores.serial(),
                            fn.inc.stores.nsn(),
                            fn.inc.stores.size()
                        ]
                    })
                    .then(lines => {
                        if (!lines || lines.length === 0) reject(new Error('No open lines on this scrap'))
                        else {
                            fn.create_barcodes(scrap.scrap_id)
                            .then(result => {
                                fn.files.create(scrap.scrap_id, 'scraps', 'scrap', user)
                                .then(([doc, file, writeStream]) => {
                                    let y = fn.files.add.Page(doc);
                                    y += fn.files.add.Logos(doc, y, 'SCRAPPED STOCK');
                                    y += addHeader(doc, y);
                                    lines.forEach(line => {
                                        if (y >= 708-(line.nsn ? 15 : 0)-(line.serial ? 15 : 0)) {
                                            y = fn.files.add.EndOfPage(doc, y);
                                            y += addHeader(doc, y);
                                        };
                                        y += addLine(doc, line, y);
                                    });
                                    addDeclaration(doc, lines.length, y);
                                    fn.files.add.PageNumbers(doc, scrap.scrap_id);
                                    doc.end();
                                    writeStream.on('error', err => reject(err));
                                    writeStream.on('finish', function () {
                                        fn.update(scrap, {filename: file})
                                        .then(result => {
                                            fn.settings.get('Print scrap')
                                            .then(settings => {
                                                if (settings.length !== 1 || settings[0].value !== '1') resolve(file)
                                                else {
                                                    fn.print_pdf(`${process.env.ROOT}/public/res/scraps/${file}`)
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
};