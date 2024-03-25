module.exports = function ( m, fn ) {
    fn.eans = {};
    fn.eans.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.eans.findAndCountAll({
                where: query.where,
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.eans.create = function ( item_id, ean ) {
        function checkDetails() {
            return new Promise( ( resolve, reject ) => {
                if ( !item_id ) {
                    reject( new Error( 'No item ID specified' ) );
    
                } else if (!ean) {
                    reject( new Error( 'No EAN specified' ) );
    
                } else {
                    resolve( { where: { item_id: item_id } } );

                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkDetails()
            .then( m.canteen_items.findOne )
            .then( fn.rejectIfNull )
            .then( item => {
                item.addEan( { ean: ean } )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.eans.delete = function ( ean_id ) {
        return new Promise( ( resolve, reject ) => {
            fn.eans.findOne({
                where: { ean_id: ean_id }
            })
            .then( fn.rejectIfNull )
            .then( ean => {
                ean.destroy()
                .then( result => resolve( true ) )
                .catch( reject );
            })
            .catch( reject );
        });
    };
};