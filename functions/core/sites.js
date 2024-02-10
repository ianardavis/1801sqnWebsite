module.exports = function (m, fn) {
    fn.sites = {};
    fn.sites.find = function (where) {
        return fn.find(
            m.sites,
            where
        );
    };
    fn.sites.findAll = function (query) {
        return new Promise((resolve, reject) => {
            let where = query.where || {};
            if (query.like) where.name = {[fn.op.substring]: query.like.name || ''};
            m.sites.findAndCountAll({
                where: where,
                ...fn.pagination(query)
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

    fn.sites.create = function (name, user_id_creator) {
        function createPermission(pm_details, permission) {
            return new Promise((resolve, reject) => {
                m.permissions.create({
                    ...pm_details,
                    permission: permission
                })
                .then(resolve)
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            m.sites.create({ name: name })
            .then(site => {
                m.user_sites.create({
                    user_id: user_id_creator,
                    site_id: site.site_id
                })
                .then(user_site => {
                    const pm_details = { site_id: site.site_id, user_id: user_id_creator };
                    Promise.allSettled([
                        createPermission(pm_details, 'site_admin'),
                        createPermission(pm_details, 'access_users'),
                        createPermission(pm_details, 'user_admin'),
                        createPermission(pm_details, 'access_settings'),
                        createPermission(pm_details, 'edit_own_permissions')
                    ])
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

    // fn.notes.edit = function (note_id, note_text) {
    //     return new Promise((resolve, reject) => {
    //         fn.notes.find({note_id: note_id})
    //         .then(note => {
    //             if (note.system) {
    //                 reject(new Error('System generated notes can not be edited'));
                    
    //             } else {
    //                 fn.update(note, note_text)
    //                 .then(result => resolve(true))
    //                 .catch(reject);
    //             };
    //         })
    //         .catch(reject);
    //     });
    // };

    // fn.sites.delete = function (site_id) {
    //     return new Promise((resolve, reject) => {
    //         fn.notes.find({note_id: note_id})
    //         .then(note => {
    //             if (note.system) {
    //                 reject(new Error('System generated notes can not be deleted'));

    //             } else {
    //                 note.destroy()
    //                 .then(result => {
    //                     if (result) {
    //                         resolve(true);

    //                     } else {
    //                         reject(new Error('Note not deleted'));

    //                     };
    //                 })
    //                 .catch(reject);

    //             };
    //         })
    //         .catch(reject);
    //     });
    // };
};