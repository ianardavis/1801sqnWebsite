module.exports = function (m, fn) {
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
};