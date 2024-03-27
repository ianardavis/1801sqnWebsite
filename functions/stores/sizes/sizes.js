module.exports = function ( m, fn ) {
    fn.sizes.find = function ( site_id, where, include = [] ) {
        return fn.find(
            m.sizes,
            {
                site_id: { [ fn.op.or ]: [ site_id, null ]  },
                ...where
            },
            [
                { model: m.items, as: 'item' },
                { model: m.suppliers, as: 'supplier' }
            ].concat( include )
        );
    };
    fn.sizes.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.sizes.findAndCountAll({
                where: query.where,
                include: [
                    { model: m.items, as: 'item' },
                    { model: m.suppliers, as: 'supplier' }
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.sizes.count = function ( where ) { return m.sizes.count( { where: where } ) };

    fn.sizes.create = function ( size ) {
        return new Promise( ( resolve, reject ) => {
            if ( size.supplier_id === '' ) size.supplier_id = null;
            m.sizes.findOrCreate({
                where: {
                    item_id: size.item_id,
                    size1:   size.size1,
                    size2:   size.size2,
                    size3:   size.size3
                },
                defaults: size
            })
            .then( fn.rejectIfNotCreated )
            .then( resolve )
            .catch( reject );
        });
    };

    fn.sizes.edit = function ( size_id, details ) {
        return new Promise( ( resolve, reject ) => {
            m.sizes.findOne({
                where: { size_id: size_id }
            })
            .then( fn.rejectIfNull )
            .then( size => {
                size.update( details )
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.sizes.delete = function (size_id) {
        return new Promise( ( resolve, reject ) => {
            const where = { size_id: size_id }
            m.sizes.findOne({
                where: where
            })
            .then( fn.rejectIfNull )
            .then( size => {
                Promise.all([
                    m.stocks.findOne( { where: where } ),
                    m.nsns  .findOne( { where: where } )
                ])
                .then( ( [ stocks, nsns ] ) => {
                    if ( stocks ) {
                        reject( new Error( 'Cannot delete a size whilst it has stock' ) );
    
                    } else if ( nsns ) {
                        reject( new Error( 'Cannot delete a size whilst it has NSNs' ) );

                    } else {
                        size.destroy()
                        .then( fn.checkResult )
                        .then( resolve )
                        .catch( reject );
                    };
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
};