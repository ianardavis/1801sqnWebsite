const fs  = require('fs');
const pdf = require('pdfkit');
const bwipjs = require('bwip-js');
const ptp = require('pdf-to-printer');
module.exports = function (m, fn) {
    fn.pdfs = {};
    fn.pdfs.create = function (id, folder, name, author) {
        return new Promise((resolve, reject) => {
            try {
                fn.fs.mkdir(folder)
                .then(result => {
                    const file = `${id}-${name}.pdf`;
                    const path = fn.public_file(folder, file);
                    let docMetadata = {};
                    let writeStream = fs.createWriteStream(path, {flags: 'w'});
    
                    docMetadata.Title = `${id}-${folder}-${name}`;
                    if (author) docMetadata.Author = `${(author.rank ? author.rank.rank : "")} ${author.full_name}`;
                    docMetadata.bufferPages   = true;
                    docMetadata.autoFirstPage = false;
                    const doc = new pdf(docMetadata);
                    doc.pipe(writeStream);
                    doc.font(`${process.env.ROOT}/public/lib/fonts/myriad-pro/d (1).woff`);
                    resolve([doc, file, writeStream]);
                })
                .catch(err => reject(err));
            } catch (err) {
                console.log(err);
                reject(err);
            };
        });
    };
    fn.pdfs.new_page = function (doc) {
    let pageMetaData = {};
    pageMetaData.size    = 'A4';
    pageMetaData.margins = 28;
    doc.addPage(pageMetaData);
    return 28;
    };
    fn.pdfs.logos = function (doc, y, title) {
        doc
            .image(`${process.env.ROOT}/public/img/rafac_logo.png`, 28,  y, {height: 80})
            .image(`${process.env.ROOT}/public/img/sqnCrest.png`,   470, y, {height: 80})
            .fontSize(30)
            .text('1801 SQUADRON ATC', 28, y, {width: 539, align: 'center'})
            .text(title,  28, y+40, {width: 539, align: 'center'});
        return 85;
    };
    fn.pdfs.page_numbers = function (doc, file_id) {
        const range = doc.bufferedPageRange();
        doc.fontSize(10);
        for (let i = range.start; i < range.count; i++) {
            const bar = fn.public_file('barcodes',`${file_id}_128.png`)
            const qr  = fn.public_file('barcodes',`${file_id}_qr.png`)
            doc.switchToPage(i);
            doc
            .text(`Page ${i + 1} of ${range.count}`, 28, 723.89)
            .image(bar, 28,  738.89, {width: 434, height: 75})
            .image(qr,  492, 738.89, {width: 75,  height: 75});
        };
    };
    fn.pdfs.end_of_page = function (doc, y) {
        doc.text('END OF PAGE', 28, y, {width: 539, align: 'center'});
        y = add_page(doc);
        return y;
    };
    function create_barcode(uuid, type) {
        return new Promise((resolve, reject) => {
            const height = (type === 'code128' ? 15 : 30)
            bwipjs.toBuffer({
                bcid:        type,  // Barcode type
                text:        uuid,  // Text to encode
                scale:       3,     // 3x scaling factor
                height:      height,// height, in mm
                includetext: false, // Show human-readable text
                backgroundcolor: 'FFFFFF',
                barcolor: '000000',
                borderleft: '5',
                borderright: '5'
            })
            .then(barcode => {
                const prepend = (type === 'code128' ? '128' : 'qr');
                const file = fn.public_file('barcodes', `${uuid}_${prepend}.png`);
                fs.writeFile(file, barcode, () => resolve());
            })
            .catch(err => reject(err));
        });
    };
    fn.pdfs.create_barcodes = function (uuid) {
        return new Promise((resolve, reject) => {
            fn.fs.mkdir('barcodes')
            .then(path => {
                Promise.allSettled([
                    create_barcode(uuid, 'code128'),
                    create_barcode(uuid, 'qrcode')
                ])
                .then(results => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.pdfs.print = function (folder, file) {
        return new Promise((resolve, reject) => {
            fn.fs.file_exists(folder, file)
            .then(path => {
                fn.settings.get('printer')
                .then(printers => {
                    if (printers.length > 1) {
                        reject(new Error('Multiple printers found'));
                    } else {
                        const options = ['-o sides=two-sided-long-edge'];
                        const printer = printers[0].value;
                        ptp
                        .print(path, {printer: printer, unix: options})
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};