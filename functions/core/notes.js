module.exports = function (m, fn) {
    fn.notes = {};
    fn.notes.get = function (where) {
        return new Promise((resolve, reject) => {
            m.notes.findOne({
                where: where,
                include: [fn.inc.users.user()]
            })
            .then(note => {
                if (note) {
                    resolve(note);

                } else {
                    reject(new Error('Note not found'));

                };
            })
        });
    };
    fn.notes.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.notes.findAndCountAll({
                where:   where,
                include: [fn.inc.users.user()],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
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
            .catch(err => reject(err));
        });
    };

    fn.notes.edit = function (note_id, note_text) {
        return new Promise((resolve, reject) => {
            fn.notes.get({note_id: note_id})
            .then(note => {
                if (note.system) {
                    reject(new Error('System generated notes can not be edited'));
                    
                } else {
                    note.update(note_text)
                    .then(result => {
                        if (result) {
                            resolve(true);

                        } else {
                            reject(new Error('Note not updated'));

                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
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
                    .catch(err => reject(err));

                };
            })
            .catch(err => reject(err));
        });
    };
};