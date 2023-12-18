module.exports = function (m, fn) {
    fn.items.create = function (item) {
        return new Promise((resolve, reject) => {
            item = fn.nullify(item);
            m.items.findOrCreate({
                where: {description: item.description},
                defaults: item
            })
            .then(([item, created]) => {
                if (created) {
                    resolve(true);

                } else {
                    reject(new Error('An item with this description already exists'));

                };
            })
            .catch(reject);
        });
    };

    fn.items.find = function (where) {
        return fn.find(
            m.items,
            where
        );
    };
    fn.items.findAll = function (query) {
        return new Promise((resolve, reject) => {
            let where = query.where || {};
            if (query.like) where.description = {[fn.op.substring]: query.like.description || ''};
            m.items.findAndCountAll({
                where: where,
                ...fn.pagination(query)
            })
            .then(items => resolve(items))
            .catch(reject);
        });
    };

    fn.items.findUniform = function (pagination) {
        return new Promise((resolve, reject) => {
            m.items.findAndCountAll({
                include: [{
                    model: m.item_categories,
                    required: true,
                    include: [{
                        model: m.categories,
                        where: {category: 'Uniform'}
                    }]
                }],
                ...pagination
            })
            .then(items => resolve(items))
            .catch(reject);
        });
    };

    fn.items.findForSupplier = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.items.findAndCountAll({
                distinct: true,
                include: [{
                    model: m.sizes,
                    where: where,
                    attributes: ['size_id']
                }],
                ...pagination
            })
            .then(items => resolve(items))
            .catch(reject);
        });
    };

    fn.items.edit = function (item_id, details) {
        return new Promise((resolve, reject) => {
            fn.items.find({item_id: item_id})
            .then(item => {
                fn.update(item, details)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.items.delete = function (item_id) {
        return new Promise((resolve, reject) => {
            m.sizes.findOne({where: {item_id: item_id}})
            .then(sizes => {
                if (sizes) {
                    reject(new Error('Cannot delete item while it has sizes assigned'));
    
                } else {
                    m.items.destroy({where: {item_id: item_id}})
                    .then(result => {
                        if (result) {
                            resolve(true);
    
                        } else {
                            reject(new Error('Item not deleted'));
    
                        };
                    })
                    .catch(reject);
    
                };
            })
            .catch(reject);
        });
    };
};