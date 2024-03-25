module.exports = function ( m, fn ) {
    fn.nsns.find = function ( where, return_null = true ) {
        return new Promise( ( resolve, reject ) => {
            m.nsns.findOne({
                where: where,
                include: [
                    { model: m.nsn_classes,   as: 'nsn_class' },
                    { model: m.nsn_countries, as: 'nsn_country' },
                    { model: m.nsn_groups,    as: 'nsn_group' },
                    {
                        model:   m.sizes,
                        include: [ { model: m.items, as: 'item' } ],
                        as:      'size'
                    }
                ]
            })
            .then( nsn => {
                if ( return_null || nsn ) {
                    resolve( nsn );

                } else {
                    reject( new Error( 'NSN not found' ) );
                };
            })
            .catch( err => fn.sendError( res, err ));
        });
    };
    fn.nsns.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.nsns.findAndCountAll({
                where: query.where,
                include: [
                    { model: m.nsn_classes,   as: 'nsn_class' },
                    { model: m.nsn_countries, as: 'nsn_country' },
                    { model: m.nsn_groups,    as: 'nsn_group' },
                    {
                        model:   m.sizes,
                        include: [ { model: m.items, as: 'item' } ],
                        as:      'size'
                    }
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.nsns.create = function ( nsn, isDefault = false ) {
        return new Promise( ( resolve, reject ) => {
            Promise.all([
                fn.sizes.find(          { size_id:        nsn.size_id } ),
                fn.nsns.groups.find(    { nsn_group_id:   nsn.nsn_group_id } ),
                fn.nsns.classes.find(   { nsn_class_id:   nsn.nsn_class_id } ),
                fn.nsns.countries.find( { nsn_country_id: nsn.nsn_country_id } )
            ])
            .then( ( [ size, nsn_group, nsn_class, nsn_country ] ) => {
                m.nsns.findOrCreate({
                    where: {
                        nsn_group_id:   nsn_group.nsn_group_id,
                        nsn_class_id:   nsn_class.nsn_class_id,
                        nsn_country_id: nsn_country.nsn_country_id,
                        item_number:    nsn.item_number
                    },
                    defaults: { size_id: nsn.size_id }
                })
                .then( ( [ nsn, created ] ) => {
                    if ( created ) {
                        if ( isDefault === '1' ) {
                            size.update( { nsn_id: nsn.nsn_id } )
                            .then( fn.checkResult )
                            .then(result => resolve( ' Set to default' ) )
                            .catch( err => {
                                console.error( err );
                                resolve( `Error setting to default: ${ err.message }` );
                            });
    
                        } else {
                            resolve( '' );
    
                        };
                    } else {
                        reject( new Error( 'NSN already exists' ) );
    
                    };
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.nsns.edit = function ( nsn_id, details ) {
        return new Promise( ( resolve, reject ) => {
            Promise.all([
                fn.nsns.find(          { nsn_id:         nsn_id }, false ),
                fn.nsns.groups.find(   { nsn_group_id:   details.nsn_group_id } ),
                fn.nsns.classes.find(  { nsn_class_id:   details.nsn_class_id } ),
                fn.nsns.countries.find({ nsn_country_id: details.nsn_country_id } )
            ])
            .then( ( [ nsn, nsn_group, nsn_class, nsn_country ] ) => {
                nsn.update({
                    nsn_group_id:   nsn_group  .nsn_group_id,
                    nsn_class_id:   nsn_class  .nsn_class_id,
                    nsn_country_id: nsn_country.nsn_country_id,
                    item_number:    details.item_number
                })
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.nsns.delete = function ( nsn_id ) {
        return new Promise( ( resolve, reject ) => {
            Promise.all([
                fn.nsns.find( { nsn_id: nsn_id }, false),
                m.action_links.findOne( { where: { _table: 'nsns', id: nsn_id } } ),
                m.loancard_lines.findOne( { where: { nsn_id: nsn_id } } )
            ])
            .then( ( [ nsn, action, line ] ) => {
                if ( action ) {
                    reject( new Error( 'NSN has actions and cannot be deleted' ) );
    
                } else if ( line ) {
                    reject( new Error( 'NSN has loancards and cannot be deleted' ) );
    
                } else {
                    nsn.destroy()
                    .then( fn.checkResult )
                    .then(result => {
                        m.sizes.update(
                            { nsn_id: null },
                            { where: { nsn_id: nsn.nsn_id } }
                        )
                        .then( result => resolve( true ) )
                        .catch( err => {
                            console.error( err );
                            resolve( false );
                        });
                    })
                    .catch( reject );
                };
            })
            .catch( reject );
        });
    };
};