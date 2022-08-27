module.exports = function (m, fn) {
    fn.notes = {};
    fn.notes.get = function (note_id) {
        return m.notes.findOne({
            where: {note_id: note_id},
            include: [fn.inc.users.user()]
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
};