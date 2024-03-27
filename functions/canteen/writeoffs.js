module.exports = function ( m, fn ) {
    fn.writeoffs = {};
    fn.writeoffs.find = function ( where ) {
        return fn.find(
            m.writeoffs,
            where,
            [
                {
                    model:      m.users,
                    include:    [ m.ranks ],
                    attributes: fn.users.attributes.slim(),
                    as:         'user'
                },
                fn.inc.canteen.item()
            ]
        );
    };
    fn.writeoffs.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.writeoffs.findAndCountAll({
                where: query.where,
                include: [
                    {
                        model:      m.users,
                        include:    [ m.ranks ],
                        attributes: fn.users.attributes.slim(),
                        as:         'user'
                    },
                    fn.inc.canteen.item()
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.writeoffs.create = function ( writeoff, user_id ) {
        function checkWriteoff( ) {
            return new Promise( ( resolve, reject ) => {
                if ( !writeoff ) {
                    reject( new Error( 'No details' ) );

                } else if ( !writeoff.reason ) {
                    reject( new Error( 'No reason' ) );
    
                } else if ( !writeoff.qty ) {
                    reject( new Error( 'No quantity' ) );
    
                } else if ( !writeoff.item_id ) {
                    reject( new Error( 'No item ID' ) );
    
                } else {
                    resolve( { where: { item_id: writeoff.item_id } } );
    
                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkWriteoff()
            .then( m.canteen_items.findOne )
            .then( fn.rejectIfNull )
            .then( item => {
                item.decrement( 'qty', { by: writeoff.qty } )
                .then( result => {
                    m.writeoffs.create({
                        ...writeoff,
                        cost:    item.cost,
                        user_id: user_id
                    })
                    .then( writeoff => resolve(true))
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
};