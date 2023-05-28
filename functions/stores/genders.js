module.exports = function (m, fn) {
    fn.genders = {};
    fn.genders.get = function (where) {
        return fn.get(
            m.genders,
            where
        );
    };
    fn.genders.get_all = function (query) {
        return new Promise((resolve, reject) => {
            m.genders.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };

    fn.genders.create = function (gender) {
        return new Promise((resolve, reject) => {
            m.genders.create(gender)
            .then(new_gender => resolve(new_gender))
            .catch(reject);
        });
    };

    fn.genders.edit = function (gender_id, details) {
        return new Promise((resolve, reject) => {
            fn.genders.get({gender_id: gender_id})
            .then(gender => {
                fn.update(gender, details)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
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
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
};