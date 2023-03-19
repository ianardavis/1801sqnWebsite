module.exports = function (m, fn) {
    fn.genders = {};
    fn.genders.get = function (where) {
        return fn.get(
            m.genders,
            where
        );
    };
    fn.genders.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.genders.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.genders.create = function (gender) {
        return new Promise((resolve, reject) => {
            m.genders.create(gender)
            .then(new_gender => resolve(new_gender))
            .catch(err => reject(err));
        });
    };

    fn.genders.edit = function (gender_id, details) {
        return new Promise((resolve, reject) => {
            fn.genders.get({gender_id: gender_id})
            .then(gender => {
                gender.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.genders.delete = function (gender_id) {
        return new Promise((resolve, reject) => {
            fn.genders.get({gender_id: gender_id})
            .then(gender => {
                m.items.update(
                    {gender_id: null},
                    {where: {gender_id: gender.gender_id}}
                )
                .then(result => {
                    gender.destroy()
                    .then(result => {
                        if (result) {
                            resolve(true);

                        } else {
                            reject(new Error('Gender not deleted'));

                        };
                    })
                    .catch(err => reject(err))
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};