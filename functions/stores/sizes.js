module.exports = function (m, fn) {
    fn.sizes = {details: {}};
    fn.sizes.get = function (size_id) {
        return new Promise((resolve, reject) => {
            m.sizes.findOne({
                where: {size_id: size_id},
                include: [m.items]
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
    fn.sizes.edit = function (size_id, details) {
        return new Promise((resolve, reject) => {
            fn.sizes.get(size_id)
            .then(size => {
                size.update(details)
                .then(result => resolve(result))
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
};