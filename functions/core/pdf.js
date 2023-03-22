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
                    const filename = `${id}-${name}.pdf`;
                    const path = fn.public_file(folder, filename);
                    let docMetadata = {};
                    let writeStream = fs.createWriteStream(path, {flags: 'w'});
                    // writeStream.on('error', err => reject(err));
                    
                    docMetadata.Title = `${id}-${folder}-${name}`;
                    if (author) docMetadata.Author = `${(author.rank ? author.rank.rank : "")} ${author.full_name}`;
                    docMetadata.bufferPages   = true;
                    docMetadata.autoFirstPage = false;
                    const doc = new pdf(docMetadata);
                    doc.pipe(writeStream);
                    doc.font(`${process.env.ROOT}/public/lib/fonts/myriad-pro/d (1).woff`);
                    resolve([doc, filename, writeStream]);
                })
                .catch(reject);
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
        y = fn.pdfs.new_page(doc);
        return y;
    };
    fn.pdfs.create_barcode = function(text, type, options) {
        return new Promise((resolve, reject) => {
            fn.fs.mkdir('barcodes')
            .then(path => {
                bwipjs.toBuffer({
                    bcid:        type, // Barcode type
                    text:        text, // Text to encode
                    borderleft:  5,
                    borderright: 5,
                    backgroundcolor: 'FFFFFF',
                    barcolor:        '000000',
                    ...options
                })
                .then(barcode => {
                    const file = fn.public_file('barcodes', `${text}_${type}.png`);
                    fs.writeFile(file, barcode, () => resolve(file));
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.pdfs.create_barcodes = function (text, options = {}) {
        return new Promise((resolve, reject) => {
            Promise.allSettled([
                fn.pdfs.create_barcode(text, 'code128', {scale: 3, height: 15, includetext: false, ...options}),
                fn.pdfs.create_barcode(text, 'qrcode',  {scale: 3, height: 30, includetext: false, ...options})
            ])
            .then(([file_128, file_qr]) => resolve([file_128.value, file_qr.value]))
            .catch(reject);
        });
    };
    fn.pdfs.print = function (folder, file) {
        return new Promise((resolve, reject) => {
            fn.fs.file_exists(folder, file)
            .then(path => {
                fn.settings.get({name: 'printer'})
                .then(printer => {
                    const options = ['-o sides=two-sided-long-edge'];
                    ptp
                    .print(path, {printer: printer.value, unix: options})
                    .then(result => resolve(true))
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
};