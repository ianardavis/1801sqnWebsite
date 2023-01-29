module.exports = function (m, fn) {
    fn.sizes = {details: {}};
    fn.sizes.get = function (where, includes = []) {
        return new Promise((resolve, reject) => {
            m.sizes.findOne({
                where: where,
                include: [
                    fn.inc.stores.item(),
                    fn.inc.stores.supplier()
                ].concat(includes)
            })
            .then(size => {
                if (size) {
                    resolve(size);

                } else {
                    reject(new Error('Size not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.sizes.getAll = function (query) {
        return new Promise((resolve, reject) => {
            m.sizes.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.stores.item(),
                    fn.inc.stores.supplier()
                ],
                ...fn.pagination(query)
            })
            .then(sizes => resolve(sizes))
            .catch(err => reject(err));
        });
    };

    fn.sizes.create = function (size) {
        return new Promise((resolve, reject) => {
            if (size.supplier_id === '') size.supplier_id = null;
            m.sizes.findOrCreate({
                where: {
                    item_id: size.item_id,
                    size1:   size.size1,
                    size2:   size.size2,
                    size3:   size.size3
                },
                defaults: size
            })
            .then(([size, created]) => {
                if (created) {
                    resolve(size);

                } else {
                    reject(new Error('This size already exists'));7

                };
            })
            .catch(err => reject(err));
        });
    };

    fn.sizes.edit = function (size_id, details) {
        return new Promise((resolve, reject) => {
            fn.sizes.get({size_id: size_id})
            .then(size => {
                size.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.sizes.delete = function (size_id) {
        return new Promise((resolve, reject) => {
            const where = {size_id: size_id}
            fn.sizes.get(where)
            .then(size => {
                Promise.all([
                    m.stocks.findOne({where: where}),
                    m.nsns  .findOne({where: where})
                ])
                .then(([stocks, nsns]) => {
                    if (stocks) {
                        reject(new Error('Cannot delete a size whilst it has stock'));
    
                    } else if (nsns) {
                        reject(new Error('Cannot delete a size whilst it has NSNs'));

                    } else {
                        size.destroy()
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.sizes.details.get = function (where) {
        return new Promise((resolve, reject) => {
            m.details.findOne({where: where})
            .then(detail => {
                if (detail) {
                    resolve(detail);
                    
                } else {
                    reject(new Error('Detail not found'));
                    
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.sizes.details.getAll = function (query) {
        return new Promise((resolve, reject) => {
            m.details.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(details => resolve(details))
            .catch(err =>    reject(err));
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
                .catch(err => reject(err))
            };
        });
    };

    fn.sizes.details.edit = function (detail_id, details) {
        return new Promise((resolve, reject) => {
            fn.sizes.details.get(detail_id)
            .then(detail => {
                detail.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.sizes.details.updateBulk = function (details) {
        return new Promise((resolve, reject) => {
            let actions = [];
            details.forEach(_detail => {
                actions.push(updateDetail(_detail.size_id, 'Cell', _detail.Cell));
                actions.push(updateDetail(_detail.size_id, 'Page', _detail.Page));
            });
            Promise.allSettled(actions)
            .then(results => {
                results.filter(e => e.status === 'rejected').forEach(e => console.log(e));
                resolve(true);
            })
            .catch(err => reject(err));
        });
    };
    function updateDetail(size_id, name, value) {
        return new Promise((resolve, reject) => {
            fn.sizes.details.get({
                size_id: size_id,
                name: `Demand ${name}`
            })
            .then(detail => {
                if (value === '') {
                    detail.destroy()
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                } else if (detail) {
                    detail.update({value: value})
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                } else {
                    m.details.create({
                        size_id: size_id,
                        name: `Demand ${name}`,
                        value: value
                    })
                    .then(result => resolve(true))
                    .catch(err => reject(err));
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
                    .catch(err => reject(err));
                } else resolve(false);
            });
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
            .catch(err => reject(err));
        });
    };
};