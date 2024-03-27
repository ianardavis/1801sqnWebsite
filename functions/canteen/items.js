module.exports = function ( m, fn ) {
    fn.canteen_items = {};
    fn.canteen_items.find = function ( where ) {
        return new Promise( ( resolve, reject ) => {
            m.canteen_items.findOne({
                where: where
            })
            .then( fn.rejectIfNull )
            .then( resolve )
            .catch( reject )
        });
    };
    fn.canteen_items.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.canteen_items.findAndCountAll({
                where: query.where,
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.canteen_items.findByEAN = function ( ean ) {
        return new Promise( ( resolve, reject ) => {
            m.eans.findOne({
                where: { ean: ean },
                include: [ { model: m.canteen_items, as: 'item' } ]
            })
            .then( fn.rejectIfNull )
            .then( _ean => {
                if ( _ean.item ) {
                    resolve( _ean.item );

                } else {
                    reject( new Error( 'No item for this EAN' ) );

                };
            })
            .catch( reject );
        });
    };

    fn.canteen_items.edit = function ( item_id, details ) {
        return new Promise( ( resolve, reject ) => {
            m.canteen_items.find({
                where: { item_id: item_id }
            })
            .then( fn.rejectIfNull )
            .then( item => {
                item.update( details )
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.canteen_items.create = function ( item ) {
        return new Promise( ( resolve, reject ) => {
            if ( item ) {
                m.canteen_items.create( item )
                .then( item => resolve( true ) )
                .catch( reject );

            } else {
                reject( new Error( 'No item details' ) );

            };
        });
    };

    fn.canteen_items.delete = function ( item_id ) {
        function check_for_linked_data( item_id ) {
            return new Promise( ( resolve, reject ) => {
                Promise.all([
                    m.sale_lines.findOne( { where: { item_id: item_id } } ),
                    m.writeoffs .findOne( { where: { item_id: item_id } } ),
                    m.receipts  .findOne( { where: { item_id: item_id } } )
                ])
                .then( fn.resolveIfAllNull )
                .then( resolve )
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            m.canteen_items.find({
                where: { item_id: item_id }
            })
            .then( fn.rejectIfNull )
            .then(item => {
                check_for_linked_data( item.item_id )
                .then( item.destroy )
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };
};