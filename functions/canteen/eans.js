module.exports = function (m, fn) {
    fn.eans = {};
    fn.eans.get_by_ID = function (ean_id) {
        return new Promise((resolve, reject) => {
            m.eans.findOne({
                where: {ean_id: ean_id}
            })
            .then(ean => {
                if (ean) {
                    resolve(ean);

                } else {
                    reject(new Error('EAN not found'));

                };
            })
            .catch(reject);
        });
    };
    fn.eans.get_by_EAN = function (ean) {
        return new Promise((resolve, reject) => {
            m.eans.findOne({
                where: {ean: ean}
            })
            .then(ean => {
                if (ean) {
                    resolve(ean);

                } else {
                    reject(new Error('EAN not found'));

                };
            })
            .catch(reject);
        });
    };
    fn.eans.get_all = function (query) {
        return new Promise((resolve, reject) => {
            m.eans.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };

    fn.eans.create = function (item_id, ean) {
        return new Promise((resolve, reject) => {
            if (!item_id) {
                reject(new Error('No item ID specified'));

            } else if (!ean) {
                reject(new Error('No EAN specified'));

            } else {
                fn.canteen_items.get({item_id: item_id})
                .then(item => {
                    // m.eans.create({
                    //     ean: ean, 
                    //     item_id: item.item_id
                    // })
                    item.addEan({ean: ean})
                    .then(ean => resolve(ean))
                    .catch(reject);
                })
                .catch(reject);

            };
        });
    };

    fn.eans.delete = function (ean_id) {
        return new Promise((resolve, reject) => {
            fn.eans.get_by_ID(ean_id)
            .then(ean => {
                if (ean) {
                    ean.destroy()
                    .then(result => resolve(true))
                    .catch(reject);

                } else {
                    reject(new Error('EAN not found'));

                };
            })
            .catch(reject);
        });
    };
};