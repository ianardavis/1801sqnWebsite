module.exports = function ( m, fn ) {
    fn.notes = {};
    fn.notes.find = function ( where ) {
        return fn.find(
            m.notes,
            where,
            [{
                model:      m.users,
                include:    [ m.ranks ],
                attributes: fn.users.attributes.slim(),
                as:         'user'
            }]
        );
    };
    fn.notes.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.notes.findAndCountAll({
                where:   query.where,
                include: [{
                    model:      m.users,
                    include:    [ m.ranks ],
                    attributes: fn.users.attributes.slim(),
                    as:         'user'
                }],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.notes.create = function ( note, user_id, id, table, system = true ) {
        return new Promise( ( resolve, reject ) => {
            m.notes.create({
                note:    note,
                id:      id,
                _table:  table,
                system:  system,
                user_id: user_id
            })
            .then(note => resolve(true))
            .catch( reject );
        });
    };

    fn.notes.edit = function ( note_id, note_text ) {
        return new Promise( ( resolve, reject ) => {
            m.notes.findOne({
                where: { note_id: note_id }
            })
            .then( fn.rejectIfNull )
            .then(note => {
                if (note.system) {
                    reject(new Error('System generated notes can not be edited'));
                    
                } else {
                    note.update( note_text )
                    .then( fn.checkResult )
                    .then( resolve )
                    .catch( reject );
                };
            })
            .catch( reject );
        });
    };

    fn.notes.delete = function ( note_id ) {
        return new Promise( ( resolve, reject ) => {
            m.notes.findOne({
                where: { note_id: note_id }
            })
            .then( fn.rejectIfNull )
            .then( note => {
                if ( note.system ) {
                    reject(new Error('System generated notes can not be deleted'));

                } else {
                    note.destroy()
                    .then( fn.checkResult )
                    .then( resolve )
                    .catch( reject );

                };
            })
            .catch( reject );
        });
    };
};