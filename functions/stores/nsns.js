module.exports = function (m, fn) {
    fn.nsns = {classes: {}, groups: {}, countries: {}};
    fn.nsns.get = function (where, return_null = true) {
        return new Promise((resolve, reject) => {
            m.nsns.findOne({
                where: where,
                include: [
                    fn.inc.stores.nsn_group(),
                    fn.inc.stores.nsn_class(),
                    fn.inc.stores.nsn_country(),
                    fn.inc.stores.size()
                ]
            })
            .then(nsn => {
                if (return_null || nsn) {
                    resolve(nsn);

                } else {
                    reject(new Error('NSN not found'));
                };
            })
            .catch(err => fn.send_error(res, err));
        });
    };
    fn.nsns.getAll = function (query) {
        return new Promise((resolve, reject) => {
            m.nsns.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.stores.nsn_group(),
                    fn.inc.stores.nsn_class(),
                    fn.inc.stores.nsn_country(),
                    fn.inc.stores.size()
                ],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.nsns.create = function (nsn, isDefault = false) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.sizes.get({size_id: nsn.size_id}),
                fn.nsns.groups   .get(nsn.nsn_group_id),
                fn.nsns.classes  .get(nsn.nsn_class_id),
                fn.nsns.countries.get(nsn.nsn_country_id)
            ])
            .then(([size, nsn_group, nsn_class, nsn_country]) => {
                m.nsns.findOrCreate({
                    where: {
                        nsn_group_id:   nsn_group.nsn_group_id,
                        nsn_class_id:   nsn_class.nsn_class_id,
                        nsn_country_id: nsn_country.nsn_country_id,
                        item_number:    nsn.item_number
                    },
                    defaults: {size_id: nsn.size_id}
                })
                .then(([nsn, created]) => {
                    if (created) {
                        if (isDefault === '1') {
                            size.update({nsn_id: nsn.nsn_id})
                            .then(result => resolve(` ${(result ? 'Set': 'Not set')} to default`))
                            .catch(err => {
                                console.log(err);
                                resolve(` Error setting to default: ${err.message}`);
                            });
    
                        } else {
                            resolve('');
    
                        };
                    } else {
                        reject(new Error('NSN already exists'));
    
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.nsns.edit = function (nsn_id, details) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.nsns.get({nsn_id: nsn_id}, false),
                fn.nsns.groups   .get(details.nsn_group_id),
                fn.nsns.classes  .get(details.nsn_class_id),
                fn.nsns.countries.get(details.nsn_country_id)
            ])
            .then(([nsn, nsn_group, nsn_class, nsn_country]) => {
                nsn.update({
                    nsn_group_id:   nsn_group  .nsn_group_id,
                    nsn_class_id:   nsn_class  .nsn_class_id,
                    nsn_country_id: nsn_country.nsn_country_id,
                    item_number:    details.item_number
                })
                .then(result => {
                    if (result) {
                        resolve(result);

                    } else {
                        reject(new Error('NSN not saved'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.nsns.delete = function (nsn_id) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.nsns.get({nsn_id: nsn_id}, false),
                m.action_links.findOne({where: {_table: 'nsns', id: nsn_id}}),
                m.loancard_lines.findOne({where: {nsn_id: nsn_id}})
            ])
            .then(([nsn, action, line]) => {
                if (action) {
                    reject(new Error('NSN has actions and cannot be deleted'));
    
                } else if (line) {
                    reject(new Error('NSN has loancards and cannot be deleted'));
    
                } else {
                    nsn.destroy()
                    .then(result => {
                        m.sizes.update(
                            {nsn_id: null},
                            {where: {nsn_id: nsn.nsn_id}}
                        )
                        .then(result => resolve(true))
                        .catch(err => {
                            console.log(err);
                            resolve(false);
                        });
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };

    fn.nsns.groups.get = function (nsn_group_id) {
        return new Promise((resolve, reject) => {
            m.nsn_groups.findOne({where: {nsn_group_id: nsn_group_id}})
            .then(nsn_class => {
                if (nsn_class) {
                    resolve(nsn_class);

                } else {
                    reject(new Error('Group not found'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.nsns.groups.getAll = function (query) {
        return new Promise((resolve, reject) => {
            m.nsn_groups.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.nsns.classes.get = function (nsn_class_id) {
        return new Promise((resolve, reject) => {
            m.nsn_classes.findOne({where: {nsn_class_id: nsn_class_id}})
            .then(nsn_class => {
                if (nsn_class) {
                    resolve(nsn_class);

                } else {
                    reject(new Error('Class not found'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.nsns.classes.getAll = function (query) {
        return new Promise((resolve, reject) => {
            if (query.nsn_group_id === '') query.nsn_group_id = null;
            m.nsn_classes.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.nsns.countries.get = function (nsn_country_id) {
        return new Promise((resolve, reject) => {
            m.nsn_countries.findOne({where: {nsn_country_id: nsn_country_id}})
            .then(nsn_class => {
                if (nsn_class) {
                    resolve(nsn_class);

                } else {
                    reject(new Error('Country not found'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.nsns.countries.getAll = function (query) {
        return new Promise((resolve, reject) => {
            m.nsn_countries.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
};