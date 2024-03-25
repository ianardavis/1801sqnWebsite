module.exports = function ( m, fn ) {
    fn.scraps.find = function (where, line_where = null) {
        return new Promise( ( resolve, reject ) => {
            m.scraps.findOne({
                where: where,
                include: [
                    { model: m.scrap_lines, as: 'lines', where: line_where },
                    { model: m.suppliers,   as: 'supplier' }
                ]
            })
            .then( fn.rejectIfNull )
            .then( resolve )
            .catch( reject );
        });
    };
    fn.scraps.findOrCreate = function ( supplier_id ) {
        function checkSupplier() {
            return new Promise( ( resolve, reject ) => {
                if ( supplier_id ) {
                    m.suppliers.findOne({
                        where: { supplier_id: supplier_id }
                    })
                    .then( fn.rejectIfNull )
                    .then( resolve )
                    .catch( reject );
    
                } else {
                    resolve( null );
    
                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkSupplier()
            .then( ( { supplier_id_checked } ) => {
                m.scraps.findOrCreate({
                    where: {
                        supplier_id: supplier_id_checked,
                        status: 1
                    }
                })
                .then(([scrap, created]) => resolve(scrap))
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.scraps.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.scraps.findAndCountAll({
                where: query.where,
                include: [
                    {
                        model: m.scrap_lines,
                        as:    'lines',
                        where: { status: { [ fn.op.ne ]: 0 } },
                        required: false
                    },
                    { model: m.suppliers, as: 'supplier' }
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.scraps.count = function ( where ) {return m.scraps.count( { where: where } ) };

    fn.scraps.edit = function ( scrap_id, details ) {
        m.scraps.findOne({
            where: { crap_id: scrap_id }
        })
        .then( fn.rejectIfNull )
        .then( scrap => {
            scrap.update( details )
            .then( fn.checkResult )
            .then( resolve )
            .catch( reject );
        })
        .catch( reject );
    };

    fn.scraps.cancel_check = function ( scrap_id ) {
        return new Promise( ( resolve, reject ) => {
            m.scraps.findOne({
                where: { scrap_id: scrap_id },
                include: [
                    { 
                        model: m.scrap_lines, 
                        as: 'lines', 
                        where: {
                            status: { [ fn.op.or ]: [ 1 ] },
                            qty:    { [ fn.op.gt ]: 0 }
                        }
                    },
                    { model: m.suppliers,   as: 'supplier' }
                ]
                
            })
            .then( fn.rejectIfNull )
            .then( scrap => {
                switch ( scrap.status ) {
                    case 0:
                        reject( new Error( 'Scrap has already been cancelled' ) );
                        break;
                
                    case 1:
                        if ( !scrap.lines || scrap.lines.length === 0 ) {
                            resolve( scrap );
    
                        } else {
                            reject( new Error( 'Scrap has open lines' ) );
    
                        };
                        break;
                
                    case 2:
                        reject( new Error( 'Scrap has already been closed' ) );
                        break;
                
                    default:
                        reject( new Error( 'Unknown scrap status' ) );
                        break;
                };
            })
            .catch( err => {
                console.error( err );
                reject( err );
            });
        });
    };
    fn.scraps.cancel = function ( scrap_id, user_id ) {
        return new Promise( ( resolve, reject ) => {
            fn.scraps.cancel_check( scrap_id )
            .then( scrap => {
                m.scrap_lines.update(
                    { status: 0 },
                    { where: {
                        scrap_id: scrap.scrap_id,
                        status: { [ fn.op.or ]: [ 1 ] }
                    }
                })
                .then( results => {
                    scrap.update( { status: 0 } )
                    .then( fn.checkResult )
                    .then( result => {
                        fn.actions.create([
                            'SCRAP | CANCELLED',
                            user_id,
                            [ { _table: 'scraps', id: scrap.scrap_id } ]
                        ])
                        .then( resolve );
                    })
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.scraps.complete = function ( scrap_id, user ) {
        function checkScrap() {
            return new Promise( ( resolve, reject ) => {
                m.scraps.findOne({
                    where: { scrap_id: scrap_id },
                    include: [{
                        model: m.scrap_lines,
                        as:    'lines',
                        where: { status: 1 },
                        required: false
                    }]
                })
                .then( fn.rejectIfNull )
                .then( scrap => {
                    switch ( scrap.status ) {
                        case 0:
                            reject( new Error( 'Scrap has already been cancelled' ) );
                            break;
                    
                        case 1:
                            if ( scrap.lines.length === 0 ) {
                                reject( new Error( 'There are no open lines for this scrap' ) );
        
                            } else {
                                resolve( scrap );
        
                            };
                            break;
                    
                        case 2:
                            reject( new Error( 'Scrap has already been closed' ) );
                            break;
                    
                        default:
                            reject( new Error( 'Unknown scrap status' ) );
                            break;
                    };
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkScrap()
            .then(scrap => {
                Promise.all(
                    scrap.lines.map( line => {
                        return new Promise( ( resolve, reject ) => {
                            line.update( { status: 2 } )
                            .then( fn.checkResult )
                            .then( resolve )
                            .catch( reject );
                        })
                    })
                )
                .then( result => {
                    scrap.update( { status: 2 } )
                    .then( fn.checkResult )
                    .then( result => {
                        fn.scraps.pdf.create( scrap.scrap_id, user )
                        .then( result => resolve( true ) )
                        .catch( err => {
                            console.error( err );
                            resolve( false );
                        });
                    })
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    function getFilename( scrap_id ) {
        return new Promise( ( resolve, reject ) => {
            m.scraps.findOne({
                where: { scrap_id: scrap_id }
            })
            .then( fn.rejectIfNull )
            .then( scrap => {
                if ( scrap.status !== 2 ) {
                    reject( new Error( 'Scrap is not complete' ) );

                } else if ( scrap.filename ) {
                    resolve( scrap.filename );

                } else {
                    fn.scraps.pdf.create( scrap.scrap_id )
                    .then( resolve )
                    .catch( reject );

                };
            })
            .catch( reject );
        });
    };
    fn.scraps.download = function ( scrap_id, res ) {
        return new Promise( ( resolve, reject ) => {
            getFilename( scrap_id )
            .then( filename => {
                fn.fs.download( 'scraps', filename, res )
                .then( result => resolve( true ) )
                .catch( reject );
            })
            .catch( reject );
        });
    };
};