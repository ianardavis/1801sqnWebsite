module.exports = function ( m, fn ) {
    fn.accounts = {};
    fn.accounts.find = function ( site_id, where ) {
        return new Promise( ( resolve, reject ) => {
            m.accounts.findOne({
                where: {
                    site_id: site_id,
                    ...where
                },
                include: [{
                    model:      m.users,
                    include:  [ m.ranks ],
                    attributes: fn.users.attributes.slim,
                    as:         'user'
                }]
            })
            .then( fn.rejectIfNull )
            .then( resolve )
            .catch( reject );
        });
    };
    fn.accounts.findAll = function ( site_id, query ) {
        return m.accounts.findAndCountAll({
            where: {
                site_id: site_id,
                ...query.where
            },
            include: [{
                model:      m.users,
                include:  [ m.ranks ],
                attributes: fn.users.attributes.slim,
                as:         'user'
            }],
            ...fn.pagination( query )
        });
    };

    fn.accounts.create = function ( site_id, details ) {
        function checkAccountDetails() {
            return new Promise( ( resolve, reject ) => {
                if ( !details.name ) {
                    reject( new Error( 'No account name' ) );

                } else if ( !details.number ) {
                    reject( new Error( 'No account #' ) );

                } else {
                    fn.users.find( { user_id: details.user_id } )
                    .then(user => resolve({
                        site_id: site_id,
                        ...details
                    }))
                    .catch( reject );

                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkAccountDetails()
            .then( m.accounts.create )
            .then( resolve )
            .catch( reject );
        });
    };

    fn.accounts.edit = function ( account_id, details ) {
        function updateAccount( account ) {
            return account.update( details );
        };
        return new Promise( ( resolve, reject ) => {
            fn.accounts.find( { account_id: account_id } )
            .then( updateAccount )
            .then( fn.checkResult )
            .then( resolve )
            .catch( reject );
        });
    };

    fn.accounts.delete = function ( account_id ) {
        function checkForLinkedData( account ) {
            return new Promise( ( resolve, reject ) => {
                Promise.allSettled([
                    fn.demands.find( { account_id: account.account_id } )
                ])
                .then( results => {
                    if ( results.filter( e => e.status === 'fulfilled' ).length > 0 ) {
                        reject( new Error( 'Account has linked data, it cannot be destroyed' ) );

                    } else {
                        resolve( account );

                    };
                })
                .catch( reject );
            });
        };
        function deleteAccount( account ) {
            return new Promise( ( resolve, reject ) => {
                account.destroy()
                .then( fn.checkResult )
                .then( result => resolve( account.account_id ))
                .catch( reject );
            });
        };
        function removeFromSupplierRecords( account_id ) {
            return new Promise( resolve => {
                m.suppliers.update(
                    { account_id: null },
                    { where: { account_id: account_id } }
                )
                .then( result => resolve( true ) )
                .catch( err => {
                    console.error( err );
                    resolve( false )
                });
            });
        };
        return new Promise( ( resolve, reject ) => {
            fn.accounts.find( { account_id: account_id } )
            .then( checkForLinkedData )
            .then( deleteAccount )
            .then( removeFromSupplierRecords )
            .then( resolve )
            .catch( reject );
        });
    };
};