module.exports = function (m, fn) {
    fn.sizes.find = function (where, include = []) {
        return fn.find(
            m.sizes,
            where,
            [
                fn.inc.stores.item(),
                fn.inc.stores.supplier()
            ].concat(include)
        );
    };
    fn.sizes.findAll = function (query) {
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
            .catch(reject);
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
            .catch(reject);
        });
    };

    fn.sizes.edit = function (size_id, details) {
        return new Promise((resolve, reject) => {
            fn.sizes.find({size_id: size_id})
            .then(size => {
                fn.update(size, details)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.sizes.delete = function (size_id) {
        return new Promise((resolve, reject) => {
            const where = {size_id: size_id}
            fn.sizes.find(where)
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
                        .catch(reject);
                    };
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
};