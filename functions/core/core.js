const bwipjs = require('bwip-js'), fs = require("fs"), ptp = require('pdf-to-printer');
module.exports = function (m, fn) {
    fn.file_exists = function (path) {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(path)) resolve(path)
            else reject(new Error('File does not exist'));
        });
    };
    fn.send_error = function (res, err) {
        if (err.message) console.log(err);
        res.send({success: false, message: err.message || err});
    };
    fn.add_years = function (years = 0) {
        let now = new Date();
        return new Date(now.getFullYear() + years, now.getMonth(), now.getDate());
    };
    fn.allowed = function (user_id, permission, allow = false) {
        return new Promise((resolve, reject) => {
            return m.permissions.findOne({
                where: {
                    permission: permission,
                    user_id:    user_id
                },
                attributes: ['permission']
            })
            .then(permission => {
                if (!permission) {
                    if (allow) resolve(false)
                    else reject(new Error(`Permission denied: ${permission}`))
                } else resolve(true);
            })
            .catch(err => reject(err));
        });
    };
    fn.counter = function () {
        let count = 0;
        return () => {
            return ++count;
        };
    };
    fn.download = function (folder, file, res) {
        return new Promise((resolve, reject) => {
            fn.file_exists(`${process.env.ROOT}/public/res/${folder}/${file}`)
            .then(path => {
                res.download(path, file, err => {
                    if (err) {
                        console.log(err);
                        resolve(false);
                    } else resolve(true);
                });
            })
            .catch(err => reject(err));
        });
    };
    fn.nullify = function (record) {
        for (let [key, value] of Object.entries(record)) {
            if (value === '') record[key] = null;
        };
        return record;
    };
    fn.promise_results = function (results) {
        let rejects = results.filter(e => e.status === 'rejected');
        rejects.forEach(reject => console.log(reject));
        return (rejects.length === 0);
    };
    fn.summer = function (items) {
        if (items == null) return 0;
        return items.reduce((a, b) => {
            return b['_qty'] == null ? a : a + b['_qty'];
        }, 0);
    };
    fn.timestamp = function () {
        let current = new Date();
        return `${String(current.getFullYear())}${String(current.getMonth() + 1).padStart(2, '0')}${String(current.getDate()).padStart(2, '0')} ${ String(current.getHours()).padStart(2, '0')}${String(current.getMinutes()).padStart(2, '0')}${String(current.getSeconds()).padStart(2, '0')}`;
    };
    fn.create_barcode = function (uuid) {
        return new Promise((resolve, reject) => {
            bwipjs.toBuffer({
                bcid:        'code128',       // Barcode type
                text:        uuid,            // Text to encode
                scale:       3,               // 3x scaling factor
                height:      15,              // Bar height, in millimeters
                includetext: true,            // Show human-readable text
                textxalign:  'center',        // Always good to set this
                backgroundcolor: 'FFFFFF',
                barcolor: '000000',
                borderleft: '5',
                borderright: '5'
            })
            .then(png => {
                fs.writeFile(`${process.env.ROOT}/public/res/barcodes/${uuid}.png`, png, () => resolve(true));
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    };
    fn.print_pdf = function (file) {
        return new Promise((resolve, reject) => {
            return fn.settings.get('printer')
            .then(printers => {
                if (printers.length > 1) reject(new Error('Multiple printers found'))
                else {
                    fn.file_exists(file)
                    .then(path => {
                        // console.log(printers[0].value);
                        // console.log('printing!');
                        // resolve(true);
                        ptp
                        .print(path, {printer: printers[0].value, unix: ["-o sides=two-sided-long-edge"]})
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.upload_file = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'suppliers',
                {supplier_id: options.supplier_id}
            )
            .then(supplier => {
                fs.copyFile(
                    options.file,
                    `${process.env.ROOT}/public/res/files/${options.filename}`,
                    function (err) {
                        if (err) {
                            if (err.code === 'EEXIST') reject(new Error('Error copying file: This file already exists'))
                            else reject(err);
                        } else {
                            return m.files.findOrCreate({
                                where: {filename: options.filename},
                                defaults: {
                                    user_id: options.user_id,
                                    supplier_id: options.supplier_id,
                                    description: options.description
                                }
                            })
                            .then(([file, created]) => {
                                if (!created) reject(new Error('File already exists'))
                                else          resolve(true);
                            })
                            .catch(err => reject(err));
                        };
                    }
                );
            })
            .catch(err => reject(err));
        });
    };
    fn.rmdir = function (folder) {
        return new Promise((resolve, reject) => {
            fn.file_exists(folder)
            .then(exists => {
                fs.rmdir(
                    folder,
                    {recursive: true},
                    err => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else resolve(true);
                    }
                );
            })
            .catch(err => reject(err));
        });
    };
    fn.get = function (table, where, include = []) {
        return new Promise((resolve, reject) => {
            m[table].findOne({
                where:   where,
                include: include
            })
            .then(result => {
                if (!result) reject(new Error(`No ${table.replace('_', ' ')} found`))
                else resolve(result);
            })
            .catch(err => reject(err));
        });
    };
};