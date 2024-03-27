module.exports = function ( m, fn ) {
    fn.scraps.lines.find = function ( where ) {
        return fn.find(
            m.scrap_lines,
            where,
            [
                { model: m.serials, as: 'serial' },
                {
                    model:   m.sizes,
                    include: [ { model: m.items, as: 'item' } ],
                    as:      'size'
                },
                {
                    model: m.scraps,
                    as:    'scrap',
                    include: [ { model: m.suppliers, as: 'supplier' } ]
                }
            ]
        );
    };
    fn.scraps.lines.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            let where = fn.buildQuery(query);
            m.scrap_lines.findAndCountAll({
                where: where,
                include: [
                    fn.inc.stores.size_filter(query),
                    {
                        model: m.nsns,
                        as:    'nsn',
                        include: [
                            { model: m.nsn_classes,   as: 'nsn_class' },
                            { model: m.nsn_countries, as: 'nsn_country' },
                            { model: m.nsn_groups,    as: 'nsn_group' }
                        ]
                    },
                    { model: m.serials, as: 'serial' },
                    { model: m.scraps,  as: 'scrap' }
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        })
    };
    
    fn.scraps.lines.create = function ( scrap_id, size_id, options = {} ) {
        function checkDetails() {
            function checkScrap() {
                return new Promise( ( resolve, reject ) => {
                    m.scraps.findOne({
                        where: { scrap_id: scrap_id }
                    })
                    .then( fn.rejectIfNull )
                    .then( resolve )
                    .catch( reject );
                });
            };
            function checkNSN( nsn_id, size_id ) {
                return new Promise( ( resolve, reject ) => {
                    m.nsns.findOne({
                        where: { nsn_id: nsn_id }
                    })
                    .then( fn.rejectIfNull )
                    .then( nsn => {
                        if ( nsn.size_id !== size_id ) {
                            reject( new Error( 'NSN not for this size' ) );
        
                        } else {
                            resolve( { nsn_id: nsn.nsn_id } );
        
                        };
                    })
                    .catch( reject );
                });
            };
            function checkSerial(serial_id, size_id) {
                return new Promise( ( resolve, reject ) => {
                    m.serials.findOne({
                        where: { serial_id: serial_id }
                    })
                    .then( fn.rejectIfNull )
                    .then( serial => {
                        if ( serial.size_id !== size_id ) {
                            reject( new Error( 'Serial not for this size' ) );
        
                        } else {
                            resolve( { serial_id: serial.serial_id } );
        
                        };
                    })
                    .catch( reject );
                });
            };
            return new Promise( ( resolve, reject ) => {
                checkScrap()
                .then( scrap => {
                    Promise.all([
                        ...( options.nsn_id    ? [ checkNSN(    options.nsn_id,    size_id ) ] : [] ),
                        ...( options.serial_id ? [ checkSerial( options.serial_id, size_id ) ] : [] )
                    ])
                    .then( results => {
                        resolve( results.reduce( ( obj, item ) => ( obj[ item.key ] = item.value, obj ) ,{} ) );
                    })
                    .catch( reject )
                })
                .catch( reject )
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkDetails()
            .then( nsnSerialWhere => {
                m.scrap_lines.findOrCreate({
                    where: {
                        scrap_id: scrap_id,
                        size_id:  size_id,
                        ...nsnSerialWhere
                    },
                    defaults: {
                        qty: options.qty
                    }
                })
                .then( ( [ line, created ] ) => {
                    if ( created ) {
                        resolve( line );

                    } else {
                        line.increment( 'qty', { by: options.qty } )
                        .then( result => {
                            if ( result ) {
                                resolve( line );

                            } else {
                                reject( new Error( 'Existing scrap line not incremented' ) );

                            };
                        })
                        .catch( reject );
                        
                    };
                })
                .catch( reject );
            })
            .catch( err => {
                console.error( err );
                reject( new Error( 'Error checking details' ) );
            });
        });
    };
    
    fn.scraps.lines.cancel = function ( line_id, qty, location, user_id ) {
        function checkLocation() {
            return new Promise( ( resolve, reject ) => {
                if ( location ) {
                    resolve( true );

                } else {
                    reject( new Error( 'No location specified' ) );

                };
            });
        };
        function cancelSerialScrap( line ) {
            return new Promise( ( resolve, reject ) => {
                if ( line.serial ) {
                    if ( line.serial.issue || line.serial.location ) {
                        reject( new Error( 'Serial is issued or in stock' ) );
    
                    } else {
                        fn.locations.findOrCreate( location )
                        .then( new_location => {
                            line.serial.update( { location_id: new_location.location_id } )
                            .then( fn.checkResult )
                            .then( result => resolve( line.scrap_id ) )
                            .catch( reject );
                        })
                        .catch( reject );
    
                    };
    
                } else {
                    reject( new Error( 'Serial not found' ) );
    
                };
            });
        };
        function cancelStockScrap( line ) {
            return new Promise( ( resolve, reject ) => {
                if ( line.qty >= qty ) {
                    line.decrement( 'qty', { by: qty } )
                    .then( result => {
                        fn.stocks.find( { size_id: line.size_id, location: location } )
                        .then( stock => {
                            fn.stocks.increment(
                                stock,
                                qty
                            )
                            .then( stock_link => {
                                fn.actions.create([
                                    `SCRAP LINE | CANCELLED | Qty: ${ qty }`,
                                    user_id,
                                    [ { _table: 'scrap_lines', id: line.line_id } ].concat( [ stock_link ] )
                                ])
                                .then( action => resolve( line.scrap_id ) );
                            })
                            .catch( reject );
                        })
                        .catch( reject );
                    })
                    .catch( reject );
    
                } else {
                    reject( new Error( 'Cancel quantity is greater than line quantity' ) );
    
                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkLocation()
            .then( result => {
                m.scraps.lines.findOne({
                    where: { line_id: line_id },
                    include: [
                        { model: m.serials, as: 'serial' },
                        { model: m.sizes,   as: 'size' }
                    ]
                })
                .then( fn.rejectIfNull )
                .then( line => {
                    ( line.size.has_serials ? cancelSerialScrap : cancelStockScrap)( line )
                    .then( resolve )
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.scraps.lines.update = function ( lines, user_id ) {
        function checkLines() {
            return new Promise( ( resolve, reject ) => {
                const filteredLines = lines.filter( e => e.status === '0' )
                if ( !filteredLines || filteredLines.length === 0 ) {
                    reject( new Error( 'No lines to cancel' ) );

                } else {
                    resolve( filteredLines )
                };
            });
        };
        function cancelLines( lines ) {
            function filterUnique( results ) {
                return new Promise( resolve => {
                    let scrapIDs = [];
                    results
                    .forEach( result => {
                        if ( !scrapIDs.includes( result ) ) scrapIDs.push( result );
                    });
                    resolve( scrapIDs );
                });
            };
            return new Promise( ( resolve, reject ) => {
                Promise.allSettled( 
                    lines.map( line => {
                        fn.scraps.lines.cancel( line.line_id, line.qty, line.location, user_id )
                    })
                )
                .then( fn.fulfilledOnly )
                .then( filterUnique )
                .then( resolve)
                .catch( reject );
            });
        };
        function checkScrap( scrap_id ) {
            return new Promise( ( resolve, reject ) => {
                fn.scraps.cancel_check( scrap_id )
                .then( scrap => {
                    fn.scraps.cancel( scrap_id, user_id )
                    .then( result => resolve( true ) )
                    .catch( reject );
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkLines()
            .then( cancelLines )
            .then( scrapIDs => {
                Promise.allSettled(
                    scrapIDs.map( checkScrap )
                )
                .then( results => resolve( true ) )
                .catch( reject );
            })
            .catch( reject );
        });
    };
};