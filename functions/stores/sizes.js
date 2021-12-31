module.exports = function (m, fn) {
    fn.sizes = {details: {}};
    fn.sizes.get = function (size_id) {
        return fn.get('sizes', {size_id: size_id}, [m.items])
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
            fn.get(
                'details',
                {
                    size_id: size_id,
                    name: `Demand ${name}`
                },
                [],
                true
            )
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