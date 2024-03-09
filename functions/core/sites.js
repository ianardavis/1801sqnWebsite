module.exports = function (m, fn) {
    fn.sites = {};
    fn.sites.find = function (where, options = {}) {
        return fn.find(
            m.sites,
            where,
            options.include || (options.for_user ? [{model: m.users, where: {user_id: options.for_user}, required: true}] : [])
        );
    };
    fn.sites.findAll = function (query, options = {}) {
        return new Promise((resolve, reject) => {
            m.sites.findAndCountAll({
                where: query.where || {},
                ...fn.pagination(query),
                include: options.include || (options.for_user ? [{model: m.users, where: {user_id: options.for_user}, required: true}] : [])
            })
            .then(sites => resolve(sites))
            .catch(reject);
        });
    };
    fn.sites.findForUser = function (user_id) {
        return new Promise((resolve, reject) => {
            m.users.findOne({
                where:   {user_id: user_id},
                include: [m.sites]
            })
            .then(user => resolve(user.sites))
            .catch(reject);
        });
    };
    fn.sites.findCurrent = function (site_id) {
        return new Promise((resolve, reject) => {
            fn.sites.find({site_id: site_id})
            .then(resolve)
            .catch(reject);
        });
    };
    fn.sites.switch = function (req) {
        return new Promise((resolve, reject) => {
            m.sites.findOne({
                where: {site_id: req.params.id},
                include: [{
                    model: m.users,
                    where: {user_id: req.user.user_id},
                    required: true
                }]
            })
            .then(site => {
                if (site) {
                    req.session.site = site.dataValues;
                    req.session.save();
                    resolve(true);
                } else {
                    reject(new Error('You do not have access to this site!'));
                };
            })
            .catch(reject);
        });
    };
    fn.sites.addUser = function (user_id, site_id) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.users.find({user_id: user_id}),
                fn.sites.find({site_id: site_id})
            ])
            .then(([user, site]) => {
                m.site_users.findOrCreate({
                    where: {
                        user_id: user.user_id,
                        site_id: site.site_id
                    }
                })
                .then(([site_user, created]) => {resolve(created)})
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.sites.create = function (name, user_id_creator) {
        function createPermission(details, permission) {
            return new Promise((resolve, reject) => {
                m.permissions.create({
                    ...details,
                    permission: permission
                })
                .then(resolve)
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            m.sites.create({ name: name })
            .then(site => {
                m.site_users.create({
                    user_id: user_id_creator,
                    site_id: site.site_id
                })
                .then(site_user => {
                    let permissionActions = [];
                    function addPermission(permission) {
                        permissionActions.push(createPermission(
                            {
                                site_id: site.site_id,
                                user_id: user_id_creator
                            },
                            permission.permission
                        ));
                        if (permission.children && permission.children.length > 0) {
                            permission.children.forEach(addPermission);
                        };
                    };
                    fn.users.permissions.tree().forEach(addPermission);

                    Promise.allSettled(permissionActions)
                    .then(results => {
                        resolve(`${results.filter(e => e.status === 'fulfilled').length} permissions successfully created`);
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.sites.delete = function (site_id) {
        return new Promise((resolve, reject) => {
            const where = { site_id: site_id };
            fn.sites.find(where)
            .then(site => {
                Promise.allSettled([
                    m.demands  .findOne({ where: where }),
                    m.issues   .findOne({ where: where }),
                    m.loancards.findOne({ where: where }),
                    m.orders   .findOne({ where: where }),
                    m.stocks   .findOne({ where: where }),
                ])
                .then(results => {
                    console.log(results);
                    if (results.filter(r = r.value).length > 0) {
                        reject(new Error('There are records on this site, it cannot be deleted'));
    
                    } else {
                        Promise.allSettled([
                            m.accounts.destroy({where: {site_id: site_id}})
                        ])
                        .then(results => {
                            site.destroy()
                            .then(resolve)
                            .catch(reject);
                        })
                        .catch(reject);
    
                    };
                })
                .catch(reject);
            })
            .catch(err => reject(new Error('Site not found')));
        });
    };
};