module.exports = function ( m, fn ) {
    fn.files.details.find = function ( where ) {
        return fn.find(
            m.file_details,
            where
        );
    };
    fn.files.details.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.file_details.findAndCountAll({
                where: query.where,
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.files.details.create = function ( details, user_id ) {
        return new Promise( ( resolve, reject ) => {
            m.files.findOne({
                where: { file_id: details.file_id }
            })
            .then( fn.rejectIfNull )
            .then( file => {
                m.file_details.findOrCreate({
                    where: {
                        file_id: details.file_id,
                        name:    details.name
                    },
                    defaults: {
                        value: details.value,
                        user_id: user_id
                    }
                })
                .then( ( [ detail, created ] ) => {
                    if ( created ) {
                        resolve( true );

                    } else {
                        detail.update({
                            value:   details.value,
                            user_id: user_id
                        })
                        .then( fn.checkResult )
                        .then( resolve )
                        .catch( reject );

                    };
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.files.details.edit = function ( file_detail_id, details ) {
        return new Promise( ( resolve, reject ) => {
            m.file_details.findOne({
                where: { file_detail_id: file_detail_id }
            })
            .then( fn.rejectIfNull )
            .then( file_detail => {
                file_detail.update( details )
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.files.details.delete = function ( file_detail_id ) {
        return new Promise( ( resolve, reject ) => {
            m.file_details.findOne({
                where: { file_detail_id: file_detail_id }
            })
            .then( fn.rejectIfNull )
            .then( detail => {
                detail.destroy()
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };
};