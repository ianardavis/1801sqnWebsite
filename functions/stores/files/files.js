module.exports = function ( m, fn ) {
    fn.files.find = function ( where ) {
        return fn.find(
            m.files,
            where,
            [{
                model:      m.users,
                as:         'user',
                include:    [ m.ranks ],
                attributes: fn.users.attributes.slim()
            }]
        );
    };
    fn.files.findAll   = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.files.findAndCountAll({
                where: query.where,
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.files.download = function( file_id, res ) {
        return new Promise( ( resolve, reject ) => {
            m.files.findOne({
                where: { file_id: file_id }
            })
            .then( fn.rejectIfNull )
            .then( file => {
                if ( !file.filename || file.filename === '' ) {
                    fn.sendError( res, 'No filename' );

                } else {
                    fn.fs.fileExists( 'files', file.filename )
                    .then( exists => {
                        const filepath = fn.publicFile( 'files', file.filename );
                        fn.fs.access( filepath, fn.fs.constants.R_OK, function ( err ) {
                            if ( err ) {
                                fn.sendError( res, err );

                            } else {
                                res.download( filepath, function ( err ) {
                                    if ( err ) console.error( err );
                                });

                            };
                        });
                    })
                    .catch( err => fn.sendError( res, err ));
                };
            })
            .catch( err => fn.sendError( res, err ));
        });
    };

    fn.files.edit     = function ( file_id, details ) {
        return new Promise( ( resolve, reject ) => {
            m.files.find({
                where: { file_id: file_id }
            })
            .then( fn.rejectIfNull )
            .then( file => {
                file.update( details )
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.files.create   = function ( details, files, user_id ) {
        return new Promise( ( resolve, reject ) => {
            if ( !files ) {
                reject( new Error( 'No file submitted' ) );
    
            } else if ( Object.keys( files ).length > 1 ) {
                Promise.allSettled( 
                    Object
                    .values( files )
                    .map( file => {
                        fn.fs.rmdir( `${ process.env.ROOT }/public/uploads/${ file.uuid }` )
                    })
                )
                .then( results => reject( new Error( 'Multiple files submitted' ) ) )
                .catch( reject );
    
            } else {
                fn.fs.uploadFile({
                    ...files.uploaded,
                    ...details,
                    user_id: user_id
                })
                .then(result => {
                    fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${files.uploaded.uuid}`)
                    .then(result => resolve(true))
                    .catch( reject );
                })
                .catch(error => {
                    fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${files.uploaded.uuid}`)
                    .then(result => reject(error))
                    .catch( reject );
                });
    
            };
        });
    };

    fn.files.delete   = function (file_id) {
        return new Promise( ( resolve, reject ) => {
            fn.files.find({file_id: file_id})
            .then(file => {
                file.destroy()
                .then(result => {
                    const path = fn.publicFile('files', file.filename);
                    fn.rm(path)
                    .then(result => resolve(true))
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
};