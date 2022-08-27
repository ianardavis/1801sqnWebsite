module.exports = function (m, fn) {
    const fs  = require('fs'),
          PDF = require('pdfkit');
    fn.files = {add: {}, details: {}};
    fn.files.get = function (file_id) {
        return new Promise((resolve, reject) => {
            m.files.findOne({where: {file_id: file_id}})
            .then(file => {
                if (file) resolve(file)
                else reject(new Error('File not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.files.edit = function (file_id, details) {
        return new Promise((resolve, reject) => {
            fn.files.get(file_id)
            .then(file => {
                file.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.files.create = function (id, folder, name, author) {
        return new Promise((resolve, reject) => {
            try {
                try {
                    let file        = `${id}-${name}.pdf`,
                        docMetadata = {},
                        writeStream = fs.createWriteStream(`${process.env.ROOT}/public/res/${folder}/${file}`, {flags: 'w'});
                    docMetadata.Title = `${id}-${folder}-${name}`;
                    if (author) docMetadata.Author = `${(author.rank ? author.rank.rank : "")} ${author.full_name}`;
                    docMetadata.bufferPages   = true;
                    docMetadata.autoFirstPage = false;
                    const doc = new PDF(docMetadata);
                    doc.pipe(writeStream);
                    doc.font(`${process.env.ROOT}/public/lib/fonts/myriad-pro/d (1).woff`);
                    resolve([doc, file, writeStream]);
                } catch (err) {
                    console.log(err);
                    reject(err);
                };
            } catch (err) {
                reject(err);
            };
        });
    };
    fn.files.details.get = function (file_detail_id) {
        return new Promise((resolve, reject) => {
            m.files.findOne({where: {file_detail_id: file_detail_id}})
            .then(file => {
                if (file) resolve(file)
                else reject(new Error('File not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.files.details.edit = function (file_detail_id, details) {
        return new Promise((resolve, reject) => {
            fn.files.details.get(file_detail_id)
            .then(file_detail => {
                file_detail.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.files.add.Page = function (doc) {
        let pageMetaData = {};
        pageMetaData.size    = 'A4';
        pageMetaData.margins = 28;
        doc.addPage(pageMetaData);
        return 28;
    };
    fn.files.add.Logos = function (doc, y, title) {
        doc
            .image(`${process.env.ROOT}/public/img/rafac_logo.png`, 28,  y, {height: 80})
            .image(`${process.env.ROOT}/public/img/sqnCrest.png`,   470, y, {height: 80})
            .fontSize(30)
            .text('1801 SQUADRON ATC', 28, y, {width: 539, align: 'center'})
            .text(title,  28, y+40, {width: 539, align: 'center'});
        return 85;
    };
    fn.files.add.PageNumbers = function (doc, file_id) {
        const range = doc.bufferedPageRange();
        doc.fontSize(10);
        for (let i = range.start; i < range.count; i++) {
            doc.switchToPage(i)//;
                //doc
                .text(`Page ${i + 1} of ${range.count}`, 28, 723.89)
                .image(`${process.env.ROOT}/public/res/barcodes/${file_id}_128.png`, 28,  738.89, {width: 434, height: 75})
                .image(`${process.env.ROOT}/public/res/barcodes/${file_id}_qr.png`,  492, 738.89, {width: 75,  height: 75});
        };
    };
    fn.files.add.EndOfPage = function (doc, y) {
        doc.text('END OF PAGE', 28, y, {width: 539, align: 'center'});
        y = fn.files.add.Page(doc);
        return y;
    };
};