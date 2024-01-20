module.exports = function (m, fn) {
    fn.sites = {};
    fn.sites.find = function (where) {
        return fn.find(
            m.sites,
            where
        );
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
    fn.sites.switch = function (req, site_id) {
        return new Promise((resolve, reject) => {
            m.user_sites.findOne({
                where: {
                    user_id: req.user.user_id,
                    site_id: site_id
                }
            })
            .then(user_site => {
                if (user_site) {
                    req.session.site = user_site.dataValues;
                    req.session.save();
                    resolve(true);
                } else {
                    reject(new Error('You do not have access to this site!'));
                };
            })
            .catch(reject);
        });
    };
    // fn.notes.findAll = function (query) {
    //     return new Promise((resolve, reject) => {
    //         m.notes.findAndCountAll({
    //             where:   query.where,
    //             include: [fn.inc.users.user()],
    //             ...fn.pagination(query)
    //         })
    //         .then(results => resolve(results))
    //         .catch(reject);
    //     });
    // };

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
                    const pm_details = {site_id: site.site_id, user_id: user_id_creator};
                    Promise.allSettled([
                        createPermission(pm_details, 'site_admin'),
                        createPermission(pm_details, 'access_users'),
                        createPermission(pm_details, 'user_admin'),
                        createPermission(pm_details, 'access_settings')
                    ])
                    .then(results => resolve(true))
                    .catch(reject);
                })
                .catch(reject);
                // grant site_admin, access_users, user_admin, access_settings
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

    // fn.notes.delete = function (note_id) {
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