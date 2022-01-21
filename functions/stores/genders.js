module.exports = function (m, fn) {
    fn.genders = {};
    fn.genders.get = function (gender_id) {
        return fn.get('genders', {gender_id: gender_id})
    };
};