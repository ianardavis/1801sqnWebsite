module.exports = function ( m, fn ) {
    fn.sessions = {};
    fn.sessions.find = function ( where ) {
        return fn.find(
            m.sessions,
            where,
            [
                fn.inc.users.user( { as: 'user_open' } ),
                fn.inc.users.user( { as: 'user_close' } )
            ]
        );
    };
    fn.sessions.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.sessions.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.users.user( { as: 'user_open' } ),
                    fn.inc.users.user( { as: 'user_close' } ),
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.sessions.findCurrent = function () {
        return new Promise( ( resolve, reject ) => {
            m.sessions.findAll({
                where: {
                    status: 1,
                    datetime_end: null
                }
            })
            .then( sessions => {
                if ( !sessions || sessions.length === 0 ) {
                    reject( new Error( 'No open session' ) );

                } else if ( sessions.length > 1 ) {
                    reject( new Error( 'Multiple sessions open' ) );

                } else {
                    resolve( sessions[0] );

                };
            })
            .catch( reject );
        });
    };
    
    fn.sessions.countCash = function ( obj ) {
        let cash = 0.0;
        for ( let denomination of Object.values( obj )) {
            for ( let value of Object.values( denomination ) ) {
                cash += Number( value );
            };
        };
        return cash;
    };
    fn.sessions.create = function ( balance, user_id ) {
        return new Promise( ( resolve, reject ) => {
            m.holdings.findOrCreate( { where: { description: 'Canteen float' } } )
            .then( ( [ holding, created ] ) => {
                m.sessions.findOrCreate({
                    where:    { status: 1 },
                    defaults: { user_id_open: user_id }
                })
                .then( ( [ session, created ] ) => {
                    if ( created ) {
                        fn.holdings.count( holding.holding_id, balance, user_id )
                        .then( result => resolve( 'Session opened' ) )
                        .catch( reject );
                        
                    } else {
                        reject( new Error( 'Session already open' ) );

                    };
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.sessions.findSales = function ( session ) {
        return new Promise( ( resolve, reject ) => {
            m.payments.findAll({
                where:   { type: { [ fn.op.or ]: [ 'Cash', 'cash' ] } },
                include: [{
                    model:    m.sales,
                    include:  [ fn.inc.users.user() ],
                    as:       'sale',
                    where:    { session_id: session_id },
                    required: true
                }]
            })
            .then( payments => {
                let takings = 0.0;
                payments.forEach( e => takings.cash += e.amount );
                resolve( takings );
            })
            .catch( reject );
        });
    };
    fn.sessions.close = function ( session_id, balance, user_id ) {
        function checkSession() {
            return new Promise ( ( resolve, reject) => {
                m.sessions.findOne({
                    where: { session_id: session_id } 
                })
                .then( fn.rejectIfNull )
                .then( session => {
                    if ( session.status !== 1 ) {
                        reject( new Error( 'This session is not open' ) );

                    } else {
                        resolve( session );

                    };
                })
                .catch( reject );
            });
        };
        function deleteOpenSales( session ) {
            return new Promise ( ( resolve, reject ) => {
                Promise.all([
                    m.sales.findAll({
                        where: {
                            session_id: session.session_id,
                            status: 1
                        }
                    })
                ])
                .then( sales => {
                    Promise.allSettled([
                        ...sales.map( sale => { m.payments  .destroy( { where: { sale_id: sale.sale_id } } ) } ),
                        ...sales.map( sale => { m.sale_lines.destroy( { where: { sale_id: sale.sale_id } } ) } ),
                        ...sales.map( sale => { sale.destroy() } ),
                    ])
                    .then( results => resolve( session ) )
                    .catch( reject );
                })
                .catch( reject );
            });
        };
        function getCashPayments( session ) {
            return new Promise ( ( resolve, reject ) => {
                m.payments.findAll({
                    where:   { type: { [ fn.op.or ]: [ 'Cash', 'cash' ] } },
                    include: [{
                        model:    m.sales,
                        include:  [ fn.inc.users.user() ],
                        as:       'sale',
                        where:    { session_id: session_id },
                        required: true
                    }]
                })
                .then( payments => {
                    const takings = payments.reduce( ( total, payment ) => total += payment.amount );
                    resolve( [session, takings] );
                })
                .catch( reject );
            });
        };
        function checkBalances( [ session, takings ] ) {
            return new Promise ( ( resolve, reject ) => {
                m.holdings.findOrCreate({ 
                    where: { description: 'Canteen float' } 
                })
                .then( ( [ holding, created ] ) => {
                    const counted = fn.sessions.countCash( balance );
                    const cashIn = counted - holding.cash;
                    const discrepency = cashIn - takings;
                    const returnValue = [
                        session,
                        holding,
                        cashIn,
                        takings
                    ];
                    if ( discrepency != 0 ) {
                        m.notes.create({
                            note:    `Canteen takings discrepency: Cash ${ ( discrepency > 0 ? 'over' : 'under' ) } by £${ discrepency.toFixed(2) }`,
                            _table:  'holdings',
                            id:      holding.holding_id,
                            system:  1,
                            user_id: user_id
                        })
                        .then(note => resolve( returnValue ) )
                        .catch( reject );
                    } else {
                        resolve( returnValue );

                    };
                })
                .catch( reject );
            });
        };
        function moveCashToHolding( [ session, holding, cashIn, takings] ) {
            return new Promise( ( resolve, reject ) => {
                fn.movements.create({
                    holding_id_to: holding.holding_id,
                    session_id:    session_id,
                    description:   'Canteen takings',
                    amount:        cashIn,
                    type:          'Cash',
                    user_id:       user_id

                })
                .then( result => resolve( [ session, takings, cashIn ] ) )
                .catch( reject );
            });
        };
        function closeSession( [ session, takings, cashIn ] ) {
            return new Promise ( ( resolve, reject ) => {
                session.update({
                    status:        2,
                    datetime_end:  Date.now(),
                    user_id_close: user_id
                })
                .then( fn.checkResult )
                .then( result => resolve( { takings: takings, cash_in: cashIn } ) )
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkSession()
            .then( deleteOpenSales )
            .then( getCashPayments )
            .then( checkBalances )
            .then( moveCashToHolding )
            .then( closeSession )
            .then( resolve )
            .catch( reject );
        });
    };
};