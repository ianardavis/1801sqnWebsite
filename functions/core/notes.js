module.exports = function (m, fn) {
    fn.notes = {};
    fn.notes.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            if      (!options.note)    reject(new Error('No note specified'))
            else if (!options.user_id) reject(new Error('No user specified'))
            else if (!options.id)      reject(new Error('No ID specified'))
            else if (!options.table)   reject(new Error('No table specified'))
            else {
                return m.notes.create({
                    note:  options.note,
                    id:  options.id,
                    _table:  options.table,
                    system:  options.system || true,
                    user_id: options.user_id
                })
                .then(note => resolve(true))
                .catch(err => reject(err));
            };
        });
    };
};