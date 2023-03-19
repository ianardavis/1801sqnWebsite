module.exports = function (m, fn) {
    fn.sizes.get = function (where, include = []) {
        return fn.get(
            m.sizes,
            where,
            [
                fn.inc.stores.item(),
                fn.inc.stores.supplier()
            ].concat(include)
        );
    };
    fn.sizes.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.sizes.findAndCountAll({
                where: where,
                include: [
                    fn.inc.stores.item(),
                    fn.inc.stores.supplier()
                ],
                ...pagination
            })
            .then(sizes => resolve(sizes))
            .catch(err => reject(err));
        });
    };
    fn.sizes.count = function (where) {return m.sizes.count({where: where})};

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
};