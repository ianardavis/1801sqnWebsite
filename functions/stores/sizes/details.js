module.exports = function (m, fn) {
    fn.sizes.details.get = function (where) {
        return fn.get(
            m.details,
            where
        );
    };
    fn.sizes.details.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.details.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(details => resolve(details))
            .catch(reject);
        });
    };

    fn.sizes.details.create = function (detail) {
        return new Promise((resolve, reject) => {
            if (!detail.name) {
                reject(new Error('Name not submitted'));
    
            } else if (!detail.name) {
                reject(new Error('Value not submitted'));
    
            } else {
                m.details.findOrCreate({
                    where: {
                        size_id: detail.size_id,
                        name:    detail.name
                    },
                    defaults: {value: detail.value}
                })
                .then(([new_detail, created]) => {
                    if (!created) {
                        reject(new Error('Detail already exists'));
    
                    } else {
                        resolve(new_detail);

                    };
                })
                .catch(reject);
            };
        });
    };

    fn.sizes.details.edit = function (detail_id, details) {
        return new Promise((resolve, reject) => {
            fn.sizes.details.get(detail_id)
            .then(detail => {
                fn.update(detail, details)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.sizes.details.update_bulk = function (details) {
        function update_detail(size_id, name, value) {
            return new Promise((resolve, reject) => {
                fn.sizes.details.get({
                    size_id: size_id,
                    name: `Demand ${name}`
                })
                .then(detail => {
                    if (value === '') {
                        detail.destroy()
                        .then(result => resolve(true))
                        .catch(reject);

                    } else if (detail) {
                        fn.update(detail, {value: value})
                        .then(result => resolve(true))
                        .catch(reject);

                    } else {
                        m.details.create({
                            size_id: size_id,
                            name: `Demand ${name}`,
                            value: value
                        })
                        .then(result => resolve(true))
                        .catch(reject);

                    };
                })
                .catch(err => {
                    if (value) {
                        m.details.create({
                            size_id: size_id,
                            name: `Demand ${name}`,
                            value: value
                        })
                        .then(result => resolve(true))
                        .catch(reject);

                    } else {
                        resolve(false);
                    
                    };
                });
            });
        };
        return new Promise((resolve, reject) => {
            let actions = [];
            details.forEach(_detail => {
                actions.push(update_detail(_detail.size_id, 'Cell', _detail.Cell));
                actions.push(update_detail(_detail.size_id, 'Page', _detail.Page));
            });
            Promise.allSettled(actions)
            .then(fn.log_rejects)
            .then(results => {
                resolve(true);
            })
            .catch(reject);
        });
    };

    fn.sizes.details.delete = function (detail_id) {
        return new Promise((resolve, reject) => {
            m.details.destroy({where: {detail_id: detail_id}})
            .then(result => {
                if (!result) {
                    reject(new Error('Detail not deleted'));
    
                } else {
                    resolve(true);
    
                };
            })
            .catch(reject);
        });
    };
};