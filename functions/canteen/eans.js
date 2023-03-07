module.exports = function (m, fn) {
    fn.eans = {};
    fn.eans.getByID = function (ean_id) {
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
            .catch(err => reject(err));
        });
    };
    fn.eans.getByEAN = function (ean) {
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
            .catch(err => reject(err));
        });
    };
    fn.eans.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.eans.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
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
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));

            };
        });
    };

    fn.eans.delete = function (ean_id) {
        return new Promise((resolve, reject) => {
            fn.eans.getByID(ean_id)
            .then(ean => {
                if (ean) {
                    ean.destroy()
                    .then(result => resolve(true))
                    .catch(err => reject(err));

                } else {
                    reject(new Error('EAN not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
};