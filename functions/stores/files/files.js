module.exports = function (m, fn) {
    fn.files.get = function (where) {
        return fn.get(
            m.files,
            where,
            [fn.inc.users.user()]
        );
    };
    fn.files.get_all   = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.files.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.files.download = function(file_id, res) {
        return new Promise((resolve, reject) => {
            fn.files.get({file_id: file_id})
            .then(file => {
                if (!file.filename || file.filename === '') {
                    fn.send_error(res, 'No filename');

                } else {
                    fn.fs.file_exists('files', file.filename)
                    .then(exists => {
                        const filepath = fn.public_file('files', file.filename);
                        fs.access(filepath, fs.constants.R_OK, function (err) {
                            if (err) {
                                fn.send_error(res, err);

                            } else {
                                res.download(filepath, function (err) {
                                    if (err) console.log(err);
                                });

                            };
                        });
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        });
    };

    fn.files.edit     = function (file_id, details) {
        return new Promise((resolve, reject) => {
            fn.files.get({file_id: file_id})
            .then(file => {
                file.update(details)
                .then(result => {
                    if (result) {
                        resolve(result);

                    } else {
                        reject(new Error('File not updated'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.files.create   = function (details, files, user_id) {
        return new Promise((resolve, reject) => {
            if (!files) {
                reject(new Error('No file submitted'));
    
            } else if (Object.keys(files).length > 1) {
                let actions = [];
                for (const [key, value] of Object.entries(files)) {
                    actions.push(fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${value.uuid}`))
                };
                Promise.allSettled(actions)
                .then(results => reject(new Error('Multiple files submitted')))
                .catch(err =>    reject(err));
    
            } else {
                fn.fs.upload_file({
                    ...files.uploaded,
                    ...details,
                    user_id: user_id
                })
                .then(result => {
                    fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${files.uploaded.uuid}`)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(error => {
                    fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${files.uploaded.uuid}`)
                    .then(result => reject(error))
                    .catch(err => reject(err));
                });
    
            };
        });
    };

    fn.files.delete   = function (file_id) {
        return new Promise((resolve, reject) => {
            fn.files.get({file_id: file_id})
            .then(file => {
                file.destroy()
                .then(result => {
                    const path = fn.public_file('files', file.filename);
                    fn.rm(path)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};