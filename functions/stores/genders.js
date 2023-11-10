module.exports = function (m, fn) {
    fn.genders = {};
    fn.genders.find = function (where) {
        return fn.find(
            m.genders,
            where
        );
    };
    fn.genders.findAll = function (query) {
        return m.genders.findAndCountAll({
            where: query.where,
            ...fn.pagination(query)
        });
    };

    fn.genders.create = function (gender) {return m.genders.create(gender)};

    fn.genders.edit = function (gender_id, details) {
        return new Promise((resolve, reject) => {
            fn.genders.find({gender_id: gender_id})
            .then(gender => {
                fn.update(gender, details)
                .then(resolve)
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.genders.delete = function (gender_id) {
        return new Promise((resolve, reject) => {
            fn.genders.find({gender_id: gender_id})
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