module.exports = function (m, fn) {
    fn.genders = {};
    fn.genders.get = function (gender_id) {
        return new Promise((resolve, reject) => {
            m.genders.findOne({where: {gender_id: gender_id}})
            .then(gender => {
                if (gender) resolve(gender)
                else reject(new Error('Gender not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.genders.edit = function (gender_id, details) {
        return new Promise((resolve, reject) => {
            fn.genders.get(gender_id)
            .then(gender => {
                gender.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};