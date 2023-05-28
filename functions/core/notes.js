module.exports = function (m, fn) {
    fn.notes = {};
    fn.notes.get = function (where) {
        return fn.get(
            m.notes,
            where,
            [fn.inc.users.user()]
        );
    };
    fn.notes.get_all = function (query) {
        return new Promise((resolve, reject) => {
            m.notes.findAndCountAll({
                where:   query.where,
                include: [fn.inc.users.user()],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };

    fn.notes.create = function (note, user_id, id, table, system = true) {
        return new Promise((resolve, reject) => {
            m.notes.create({
                note:    note,
                id:      id,
                _table:  table,
                system:  system,
                user_id: user_id
            })
            .then(note => resolve(true))
            .catch(reject);
        });
    };

    fn.notes.edit = function (note_id, note_text) {
        return new Promise((resolve, reject) => {
            fn.notes.get({note_id: note_id})
            .then(note => {
                if (note.system) {
                    reject(new Error('System generated notes can not be edited'));
                    
                } else {
                    fn.update(note, note_text)
                    .then(result => resolve(true))
                    .catch(reject);
                };
            })
            .catch(reject);
        });
    };

    fn.notes.delete = function (note_id) {
        return new Promise((resolve, reject) => {
            fn.notes.get({note_id: note_id})
            .then(note => {
                if (note.system) {
                    reject(new Error('System generated notes can not be deleted'));

                } else {
                    note.destroy()
                    .then(result => {
                        if (result) {
                            resolve(true);

                        } else {
                            reject(new Error('Note not deleted'));

                        };
                    })
                    .catch(reject);

                };
            })
            .catch(reject);
        });
    };
};