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
                    req.session.site_id = user_site.site_id;
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

    // fn.notes.create = function (note, user_id, id, table, system = true) {
    //     return new Promise((resolve, reject) => {
    //         m.notes.create({
    //             note:    note,
    //             id:      id,
    //             _table:  table,
    //             system:  system,
    //             user_id: user_id
    //         })
    //         .then(note => resolve(true))
    //         .catch(reject);
    //     });
    // };

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