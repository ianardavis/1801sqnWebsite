module.exports = function ( m, fn ) {
    fn.movements = {};
    fn.movements.find = function ( where ) {
        return fn.find(
            m.movements,
            where,
            [
                { model: m.sessions, as: 'session' },
                { model: m.holdings, as: 'holding_to' },
                { model: m.holdings, as: 'holding_from' },
                fn.inc.users.user()
            ]
        );
    };
    fn.movements.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.movements.findAndCountAll({
                where: query.where,
                include: [
                    { model: m.sessions, as: 'session' },
                    { model: m.holdings, as: 'holding_to' },
                    { model: m.holdings, as: 'holding_from' },
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    //
    fn.movements.create = function (movement, user_id) {
        function checkMovement() {
            return new Promise( ( resolve, reject ) => {
                if ( !movement ) {
                    reject( new Error( 'No details' ) );

                } else if ( !movement.holding_id_from && !movement.session_id ) {
                    reject( new Error( 'No source holding/canteen session submitted' ) );
                    
                } else if ( !movement.holding_id_to ) {
                    reject( new Error( 'No destination holding submitted' ) );
                    
                } else if ( !movement.description ) {
                    reject( new Error( 'No description submitted' ) );
                    
                } else if ( !movement.amount ) {
                    reject( new Error( 'No amount submitted' ) );
                    
                } else if ( movement.holding_id_from === movement.holding_id_to) {
                    reject( new Error( 'Source holding is same as destination holding' ) );
                    
                } else {
                    resolve( movement );
                    
                };
            });
        };
        function getHoldings( movement ) {
            return new Promise( ( resolve, reject ) => {
                let actions = [ fn.holdings.find( { holding_id: movement.holding_id_to } ) ];
                if ( movement.holding_id_from ) {
                    actions.push( fn.holdings.find( { holding_id: movement.holding_id_from } ) );

                } else {
                    actions.push( m.sessions.findOne( { where: { session_id: movement.session_id } } ) );

                };
                Promise.all(actions)
                .then( results => resolve( [ results[1], results[0], movement ] ) )
                .catch( reject );
            });
        };
        function transferCash( [ holding_from, holding_to, movement ] ) {
            return new Promise( ( resolve, reject ) => {
                if ( movement.holding_id_from && holding_from.cash < Number( movement.amount ) ) {
                    reject( new Error( 'Not enough cash in source holding' ) );

                } else {
                    let actions = [ holding_to.increment( 'cash', { by: movement.amount } ) ];
                    if ( movement.holding_id_from ) {
                        actions.push( holding_from.decrement( 'cash', { by: movement.amount } ) );

                    };
                    return Promise.all(actions)
                    .then( result => resolve( movement ) )
                    .catch( reject );

                };
            });
        };
        function createMovementRecord( movement ) {
            return new Promise( resolve => {
                m.movements.create({
                    ...movement,
                    type: 'Cash',
                    user_id: user_id
                })
                .then( movementRecord => resolve( true ) )
                .catch( err => {
                    console.error(err);
                    resolve( false )
                } );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkMovement( )
            .then( getHoldings )
            .then( transferCash )
            .then( createMovementRecord )
            .then( resolve )
            .catch( reject );
        });
    };
    //
};