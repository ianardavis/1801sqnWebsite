module.exports = function ( m, fn ) {
    fn.sizes.details.find = function ( where ) {
        return fn.find(
            m.details,
            where
        );
    };
    fn.sizes.details.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.details.findAndCountAll({
                where: query.where,
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.sizes.details.create = function ( detail ) {
        function checkDetails() {
            return new Promise( ( resolve, reject ) => {
                if ( !detail.name ) {
                    reject( new Error( 'Name not submitted' ) );
        
                } else if (!detail.value) {
                    reject( new Error( 'Value not submitted' ) );
        
                } else {
                    resolve( true );

                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkDetails()
            .then( result => {
                m.details.findOrCreate({
                    where: {
                        size_id: detail.size_id,
                        name:    detail.name
                    },
                    defaults: { value: detail.value }
                })
                .then( fn.rejectIfNotCreated )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.sizes.details.edit = function ( detail_id, details ) {
        return new Promise( ( resolve, reject ) => {
            m.sizes.details.findOne({
                where: { detail_id: detail_id }
            })
            .then( fn.rejectIfNull )
            .then( detail => {
                detail.update( details )
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.sizes.details.updateBulk = function ( details ) {
        function updateDetail( size_id, name, value ) {
            function createDetail() {
                return m.details.create({
                    size_id: size_id,
                    name: `Demand ${ name }`,
                    value: value
                })
            };
            return new Promise( ( resolve, reject ) => {
                m.sizes.details.findOne({
                    where: {
                        size_id: size_id,
                        name: `Demand ${ name }`
                    }
                })
                .then( fn.rejectIfNull )
                .then( detail => {
                    if ( value === '' ) {
                        detail.destroy()
                        .then( fn.checkResult )
                        .then( resolve )
                        .catch( reject );

                    } else if ( detail ) {
                        detail.update( { value: value } )
                        .then( fn.checkResult )
                        .then( resolve )
                        .catch( reject );

                    } else {
                        createDetail()
                        .then( new_detail => resolve( true ) )
                        .catch( reject );

                    };
                })
                .catch(err => {
                    if ( value ) {
                        createDetail()
                        .then( new_detail => resolve( true ) )
                        .catch( reject );

                    } else {
                        resolve( false );
                    
                    };
                });
            });
        };
        return new Promise( ( resolve, reject ) => {
            Promise.allSettled( 
                details.map( ( { size_id, Cell, Page } ) => {
                    updateDetail( size_id, 'Cell', Cell );
                    updateDetail( size_id, 'Page', Page );
                })
            )
            .then( fn.logRejects )
            .then( results => {
                resolve( true );
            })
            .catch( reject );
        });
    };

    fn.sizes.details.delete = function ( detail_id ) {
        return new Promise( ( resolve, reject ) => {
            m.details.findOne({
                where: { detail_id: detail_id }
            })
            .then( fn.rejectIfNull )
            .then( detail => {
                detail.destroy()
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject )
        });
    };
};