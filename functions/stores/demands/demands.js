module.exports = function ( m, fn ) {
    const lineStatus = {
        0: "Cancelled", 
        1: "Pending", 
        2: "Open", 
        3: "Closed"
    };
    
    fn.demands.count = function ( where ) { return m.demands.count( { where: where } ) };
    
    fn.demands.find = function ( where, include = [] ) {
        return fn.find(
            m.demands,
            where,
            include
        );
    };
    fn.demands.findAll = function ( query ) {
        return m.demands.findAndCountAll({
            where: query.where,
            include: [
                { model: m.users, include: [m.ranks], attributes: fn.users.attributes.slim(), as: 'user' },
                { model: m.suppliers, as: 'supplier' }
            ],
            ...fn.pagination( query )
        });
    };
    fn.demands.findUsers = function ( demand_id ) {
        return m.users.findAll({
            order:      [ [ 'surname', 'ASC' ] ],
            attributes: [ "user_id", "full_name", "surname", "first_name" ],
            include:    [
                m.ranks,
                {
                    model:    m.issues,
                    required: true,
                    include:  [{
                        model:    m.orders,
                        where:    { status: 2 },
                        required: true,
                        include:  [{
                            model:    m.demand_lines,
                            where:    { status: 2 },
                            required: true,
                            include:  [{
                                model:    m.demands,
                                where:    { demand_id: demand_id },
                                required: true
                            }]
                        }]
                    }] 
                }
            ]
        });
    };
    
    fn.demands.create = function ( supplier_id, user_id, return_append = [] ) {
        function createDemand( supplier ) {
            return new Promise( ( resolve, reject ) => {
                m.demands.findOrCreate({
                    where: {
                        supplier_id: supplier.supplier_id,
                        status: 1
                    },
                    defaults: { user_id: user_id }
                })
                .then( ( [ demand, created ] ) => {
                    if ( created ) {
                        fn.actions.create([
                            'DEMAND | CREATED',
                            user_id,
                            [ { _table: 'demands', id: demand.demand_id } ]
                        ])
                        .then( result => resolve( demand ) );

                    } else {
                        resolve( demand );

                    };
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            m.suppliers.findOne({
                where: { supplier_id: supplier_id } 
            })
            .then( fn.rejectIfNull )
            .then( createDemand )
            .then( demand => resolve( [ demand ].concat( return_append ) ) )
            .catch( reject );
        });
    };

    fn.demands.complete = function ( demand_id, user ) {
        function checkDemand() {
            return new Promise( ( resolve, reject ) => {
                m.demands.find({
                    where: { demand_id: demand_id },
                    include: [{
                        model: m.demand_lines,
                        as: 'lines',
                        where: { status: 1 },
                        required: false,
                        include: [ m.orders ]
                    }]
                })
                .then( demand => {
                    if ( demand.status !== 1 ) {
                        reject( new Error( 'This demand is not in draft' ) );
    
                    } else if (demand.lines.length === 0) {
                        reject( new Error( 'No pending lines for this demand' ) );
    
                    } else {
                        resolve( demand );
    
                    };
                })
                .catch( reject );
            });
        };
        function updateLines( demand ) {
            function updateRecord( record ) {
                return new Promise( ( resolve, reject ) => {
                    record.update( { status: 2 } )
                    .then( fn.checkResult )
                    .then( resolve )
                    .catch( reject );
                });
            };
            return new Promise( ( resolve, reject ) => {
                Promise.all( 
                    demand.lines.map( updateRecord )
                )
                .then(result => resolve( demand ) )
                .catch( reject );
            });
        };
        function updateDemand( demand ) {
            return new Promise( ( resolve, reject ) => {
                demand.update( { status: 2 } )
                .then( fn.checkResult )
                .then( result => resolve([
                    'DEMAND | COMPLETED',
                    user.user_id,
                    [ { _table: 'demands', id: demand.demand_id } ],
                    [ demand.demand_id, user ]
                ]))
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkDemand()
            .then( updateLines )
            .then( updateDemand )
            .then( fn.actions.create )
            .then( fn.demands.file.create )
            .then( resolve )
            .catch( reject );
        });
    };

    fn.demands.cancel = function ( demand_id, user_id ) {
        function checkDemand( demand_id ) {
            return new Promise( ( resolve, reject ) => {
                m.demands.find({
                    where: { demand_id: demand_id },
                    include: [{
                        model: m.demand_lines,
                        as: 'lines',
                        where: { status: 3 },
                        required: false 
                    }]
                })
                .then( demand => {
                    if ( [ 0, 3 ].includes( demand.status ) ) {
                        reject( new Error( `This demand has already been ${ lineStatus[ demand.status ].toLowerCase() }` ) );
    
                    } else if ( demand.lines.length > 0 )        {
                        reject( new Error( 'You can not cancel a demand with received lines' ) );
    
                    } else {
                        resolve( demand );
    
                    };
                })
                .catch( reject );
            });
        };
        function updateLines( demand ) {
            function getOpenLines() {
                return new Promise( ( resolve, reject ) => {
                    m.demands.lines.findAll({
                        where: {
                            demand_id: demand.demand_id,
                            status: { [ fn.op.or ]: [ 1, 2 ] }
                        }
                    })
                    .then( resolve )
                    .catch( reject );
                });
            };
            function cancelLines(lines) {
                return new Promise( ( resolve, reject ) => {
                    Promise.all(
                        lines.map( demand_line => 
                            fn.demands.lines.cancel(
                                demand_line.line_id,
                                user_id
                            )
                        )
                    )
                    .then( results => resolve( true ) )
                    .catch( reject );
                })
            };
            return new Promise( ( resolve, reject ) => {
                getOpenLines()
                .then ( cancelLines )
                .then( result => resolve( demand ) )
                .catch( reject );
            });
        };
        function updateDemand( demand ) {
            return new Promise( ( resolve, reject ) => {
                demand.update( { status: 2 } )
                .then( fn.checkResult )
                .then( result => resolve([
                    'CANCELLED',
                    demand.demand_id,
                    user_id
                ]))
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkDemand( demand_id )
            .then( updateLines )
            .then( updateDemand )
            .then( fn.actions.create )
            .then( result => resolve( true ) )
            .catch( reject );
        });
    };

    fn.demands.close = function ( demand_id, user_id ) {
        function checkDemand() {
            return new Promise( ( resolve, reject ) => {
                m.demands.findOne({
                    where: { demand_id: demand_id },
                    include: [{
                        model: m.demand_lines,
                        as: 'lines',
                        where: { status: { [ fn.op.or ]: [ 1, 2 ] } },
                        required: false
                    }]
                })
                .then( fn.rejectIfNull )
                .then( demand => {
                    if ( demand.status !== 2 ) {
                        reject( new Error( 'This demand is not complete' ) );
    
                    } else if ( demand.lines && demand.lines.length > 0 ) {
                        reject( new Error( 'This demand has pending or open lines' ) );
                        
                    } else {
                        resolve( demand );
    
                    };
                })
                .catch( reject );
            });
        };
        function updateDemand( demand ) {
            return new Promise( ( resolve, reject ) => {
                demand.update( { status: 3 } )
                .then( fn.checkResult )
                .then( result => {
                    resolve([
                        'DEMAND | CLOSED',
                        user_id,
                        [ { _table: 'demands', id: demand.demand_id } ]
                    ]);
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkDemand()
            .then( updateDemand )
            .then( fn.actions.create )
            .then( result => resolve( true ) )
            .catch( reject );
        });
    };

    fn.demands.download = function ( req, res ) {
        m.demands.findOne({ 
            where: { demand_id: req.params.id }
        })
        .then( fn.rejectIfNull )
        .then( demand => {
            if ( demand.filename ) {
                fn.fs.download( 'demands', demand.filename, res );

            } else {
                fn.demands.file.create( [ demand.demand_id, req.user ] )
                .then( file => fn.fs.download( 'demands', file, res ) )
                .catch( err => fn.sendError( res, err ) );

            };
        })
        .catch( err => fn.sendError( res, err ));
    };
};