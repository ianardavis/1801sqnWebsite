module.exports = function (m, fn) {
    fn.files.details.get = function (where) {
        return fn.get(
            m.file_details,
            where
        );
    };
    fn.files.details.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.file_details.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.files.details.create = function (details, user_id) {
        return new Promise((resolve, reject) => {
            fn.files.get({file_id: details.file_id})
            .then(file => {
                m.file_details.findOrCreate({
                    where: {
                        file_id: details.file_id,
                        name:    details.name
                    },
                    defaults: {
                        value: details.value,
                        user_id: user_id
                    }
                })
                .then(([detail, created]) => {
                    if (created) {
                        resolve(true);

                    } else {
                        detail.update({
                            value:   details.value,
                            user_id: user_id
                        })
                        .then(result => resolve(true))
                        .catch(err => reject(err));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.files.details.edit = function (file_detail_id, details) {
        return new Promise((resolve, reject) => {
            fn.files.details.get({file_detail_id: file_detail_id})
            .then(file_detail => {
                file_detail.update(details)
                .then(result => {
                    if (result) {
                        resolve(result);

                    } else {
                        reject(new Error('File detail not updated'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.files.details.delete = function (file_detail_id) {
        return new Promise((resolve, reject) => {
            m.file_details.destroy({
                where: {file_detail_id: file_detail_id}
            })
            .then(result => {
                if (result) {
                    resolve(true);
    
                } else {
                    reject(new Error('Detail not deleted'));
                
                };
            })
            .catch(err => reject(err));
        });
    };
};