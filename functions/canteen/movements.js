module.exports = function ( m, fn ) {
    fn.movements = {};
    const include = [
        { model: m.sessions, as: 'session' },
        { model: m.holdings, as: 'holding_to' },
        { model: m.holdings, as: 'holding_from' },
        {
            model:      m.users,
            include:    [ m.ranks ],
            attributes: fn.users.attributes.slim(),
            as:         'user'
        }
    ];
    fn.movements.find = function ( where ) {
        return new Promise( ( resolve, reject ) => {
            m.movements.findOne({
                where: where,
                include: include
            })
            .then( fn.rejectIfNull )
            .then( resolve )
            .catch( reject );
        });
    };
    fn.movements.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.movements.findAndCountAll({
                where: query.where,
                include: include,
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
                    resolve( true );
                    
                };
            });
        };
        function getHoldings() {
            return new Promise( ( resolve, reject ) => {
                Promise.all([
                    m.holdings.findOne( { where: { holding_id: movement.holding_id_to } } ),
                    ( movement.holding_id_from ? 
                        m.holdings.findOne( { where: { holding_id: movement.holding_id_from } } ) :
                        m.sessions.findOne( { where: { session_id: movement.session_id } } )
                    )
                ])
                .then( ( [ holding_to, source ] ) => resolve( [ source, holding_to ] ) )
                .catch( reject );
            });
        };
        function transferCash( [ source, holding_to ] ) {
            return new Promise( ( resolve, reject ) => {
                if ( movement.holding_id_from && source.cash < Number( movement.amount ) ) {
                    reject( new Error( 'Not enough cash in source holding' ) );

                } else {
                    let actions = [ holding_to.increment( 'cash', { by: movement.amount } ) ];
                    if ( movement.holding_id_from ) {
                        actions.push( source.decrement( 'cash', { by: movement.amount } ) );

                    };
                    return Promise.all(actions)
                    .then( result => resolve( true ) )
                    .catch( reject );

                };
            });
        };
        function createMovementRecord() {
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