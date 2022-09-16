module.exports = function (m, fn) {
    fn.scraps = {lines: {}};
    fn.scraps.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.scrap_id) {
                m.scraps.findByPk(options.scrap_id)
                .then(scrap => {
                    if (scrap) {
                        resolve(scrap)
                    } else {
                        reject(new Error('Scrap not found'));
                    };
                })
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
    fn.scraps.edit = function (scrap_id, details) {
        fn.scraps.get({scrap_id: scrap_id})
        .then(scrap => {
            scrap.update(details)
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    };
    fn.scraps.lines.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            m.scrap_lines.findAll({
                where: options.where || {},
                include: [
                    fn.inc.stores.serial(),
                    fn.inc.stores.nsn(),
                    fn.inc.stores.size()
                ]
            })
            .then(lines => resolve(lines))
            .catch(err => reject(err));
        })
    };
    function check_nsn(nsn_id, size_id) {
        return new Promise((resolve, reject) => {
            m.nsns.findByPk(nsn_id)
            .then(nsn => {
                if (!nsn) {
                    reject(new Error('NSN not found'))
                } else if (nsn.size_id !== size_id) {
                    reject(new Error('NSN not for this size'))
                } else {
                    resolve(true);
                };
            })
            .catch(err => reject(err));
        });
    };
    function check_serial(serial_id, size_id) {
        return new Promise((resolve, reject) => {
            m.serials.findByPk(serial_id)
            .then(serial => {
                if (!serial) {
                    reject(new Error('Serial not found'))
                } else if (serial.size_id !== size_id) {
                    reject(new Error('Serial not for this size'))
                } else {
                    resolve(true);
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.scraps.lines.add = function (scrap_id, size_id, options = {}) {
        return new Promise((resolve, reject) => {
            Promise.all([]
                .concat((options.nsn_id    ? [check_nsn(   options.nsn_id,    size_id)] : []))
                .concat((options.serial_id ? [check_serial(options.serial_id, size_id)] : []))
            )
            .then(preChecks => {
                m.scrap_lines.findOrCreate({
                    where: {
                        scrap_id: scrap_id,
                        size_id:  size_id,
                        ...(options.nsn_id    ? {nsn_id:    options.nsn_id}    : {}),
                        ...(options.serial_id ? {serial_id: options.serial_id} : {})
                    },
                    defaults: {
                        qty: options.qty
                    }
                })
                .then(([line, created]) => {
                    if (created) {
                        resolve(true);

                    } else {
                        line.increment('qty', {by: options.qty})
                        .then(result => {
                            if (result) {
                                resolve(result);

                            } else {
                                reject(new Error('Existing scrap line not incremented'));

                            };
                        })
                        .catch(err => reject(err));
                        
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => {
                console.log(err);
                reject(new Error('Error doing pre scrap checks'));
            });
        });
    };
    
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
    fn.scraps.createPDF = function (scrap_id, user) {
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

    function complete_check(scrap) {
        return new Promise((resolve, reject) => {
            if (scrap.status === 0) {
                reject(new Error('The scrap has been cancelled'));
            } else if (scrap.status === 2) {
                reject(new Error('This scrap has already been completed'));
            } else if (scrap.status === 1) {
                if (scrap.lines.length === 0) {
                    reject(new Error('There are no open lines for this scrap'));
                } else {
                    resolve(true);
                };
            } else {
                reject (new Error('Unknown status'));
            };
        });
    };
    fn.scraps.complete = function (scrap_id, user) {
        return new Promise((resolve, reject) => {
            m.scraps.findOne({
                where: {scrap_id: scrap_id},
                include: [
                    {
                        model: m.scrap_lines,
                        as:    'lines',
                        where: {status: 1},
                        required: false
                    }
                ]
            })
            .then(scrap => {
                complete_check(scrap)
                .then(result => {
                    let actions = [];
                    scrap.lines.forEach((line) => {
                        actions.push(line.update({status: 2}));
                    });
                    Promise.all(actions)
                    .then(result => {
                        scrap.update({status: 2})
                        .then(result => {
                            if (result) {
                                fn.scraps.createPDF(scrap.scrap_id, user)
                                .then(result => resolve(true))
                                .catch(err => {
                                    console.log(err);
                                    resolve(false);
                                });
                            } else {
                                reject(new Error('Scrap not updated'));
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
};