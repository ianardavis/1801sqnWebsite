module.exports = function (m, fn) {
    fn.files = {};
    fn.files.get = function (file_id) {
        return fn.get('files', {file_id: file_id})
    };
};