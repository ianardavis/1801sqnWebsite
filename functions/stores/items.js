module.exports = function (m, fn) {
    fn.items = {categories: {}};
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
            .catch(err => reject(err));
        });
    };

    fn.items.getOne = function (where) {
        return new Promise((resolve, reject) => {
            m.items.findOne({
                where: where,
                include: [m.genders]
            })
            .then(item => {
                if (item) {
                    resolve(item);

                } else {
                    reject(new Error('Item not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.items.getAll = function (query) {
        return new Promise((resolve, reject) => {
            let where = query.where || {};
            if (query.like) where.description = {[op.substring]: query.like.description || ''};
            m.items.findAndCountAll({
                where:   where,
                include: [fn.inc.stores.gender()],
                ...fn.pagination(query)
            })
            .then(items => resolve(items))
            .catch(err => reject(err));
        });
    };

    fn.items.getUniform = function (query) {
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
                ...fn.pagination(query)
            })
            .then(items => resolve(items))
            .catch(err => reject(err));
        });
    };

    fn.items.getForSupplier = function (where, pagination) {
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
            .catch(err => reject(err));
        });
    };

    fn.items.edit = function (item_id, details) {
        return new Promise((resolve, reject) => {
            fn.items.getOne({item_id: item_id})
            .then(item => {
                item.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
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
                    .catch(err => reject(err));
    
                };
            })
            .catch(err => reject(err));
        });
    };

    fn.items.categories.getOne = function (where) {
        return new Promise((resolve, reject) => {
            m.item_categories.findOne({
                where: where,
                include: [m.categories]
            })
            .then(category => {
                if (category) {
                    resolve(category);
    
                } else {
                    reject(new Error('Category not found'));
    
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.items.categories.getAll = function (query) {
        return new Promise((resolve, reject) => {
            m.item_categories.findAndCountAll({
                where:   query.where,
                include: [fn.inc.stores.category()],
                ...fn.pagination(query)
            })
            .then(categories => resolve(categories))
            .catch(err => reject(err));
        });
    };

    fn.items.categories.create = function (item_id, category_id) {
        return new Promise((resolve, reject) => {
            Promise.all([
                m.items     .findOne({where: {item_id:     item_id}}),
                m.categories.findOne({where: {category_id: category_id}})
            ])
            .then(([item, category]) => {
                if (item && category) {
                    m.item_categories.findOrCreate({
                        where: {
                            item_id:     item_id,
                            category_id: category_id
                        }
                    })
                    .then(([category, created]) => resolve(true))
                    .catch(err => reject(err));

                } else {
                    reject(new Error(`Item or category not found`));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.items.categories.delete = function (item_category_id) {
        return new Promise((resolve, reject) => {
            m.item_categories.destroy({where: {item_category_id: item_category_id}})
            .then(result => {
                if (result) {
                    resolve(true);

                } else {
                    reject(new Error('Category not deleted'));

                };
            })
            .catch(err => reject(err));
        });
    };
};