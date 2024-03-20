module.exports = function ( m, fn ) {
    fn.paid_in_outs = {};
    
    fn.paid_in_outs.find = function ( where ) {
        return fn.find(
            m.paid_in_outs,
            where,
            [
                fn.inc.users.user({as: 'user_paid_in_out'}),
                fn.inc.users.user(),
                { model: m.holdings, as: 'holding' }
            ]
        );
    };
    fn.paid_in_outs.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.paid_in_outs.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.users.user( { as: 'user_paid_in_out' } ),
                    { model: m.holdings, as: 'holding' }
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    function createAction( paid_in_out_id, action, user_id, links = [] ) {
        return new Promise(resolve => {
            fn.actions.create([
                `PAID OUT | ${ action }`,
                user_id,
                [ { _table: 'paid_in_outs', id: paid_in_out_id } ].concat( links )
            ])
            .then( action => resolve( true ) );
        });
    };
    function markComplete( paid_in_out, user_id, holding_id ) {
        return new Promise( ( resolve, reject ) => {
            paid_in_out.update( { status: 2 } )
            .then( fn.checkResult )
            .then( result => {
                createAction(
                    paid_in_out.paid_in_out_id,
                    'COMPLETED',
                    user_id,
                    [ { _table: 'holdings', id: holding_id } ]
                )
                .then( resolve );
            })
            .catch( reject );
        });
    };
    function markCancelled( paid_in_out, user_id ) {
        return new Promise( ( resolve, reject ) => {
            paid_in_out.update( { status: 0 } )
            .then( fn.checkResult )
            .then(result => {
                createAction( paid_in_out.paid_in_out_id, 'CANCELLED', user_id )
                .then( resolve );
            })
            .catch( reject );
        });
    };
    
    fn.paid_in_outs.create = function ( paid_in_out, user_id ) {
        function check( paid_in_out ) {
            return new Promise( ( resolve, reject ) => {
                if ( !paid_in_out.reason ) {
                    reject( new Error('No reason' ) );
                    
                } else if ( !paid_in_out.amount ) {
                    reject( new Error('No amount' ) );
                    
                } else if ( !paid_in_out.holding_id ) {
                    reject( new Error('No holding' ) );
                    
                } else if ( !paid_in_out.user_id_paid_in_out ) {
                    reject( new Error('No user' ) );
                    
                } else if ( !paid_in_out.paid_in ) {
                    reject( new Error( 'No type' ) );
                    
                } else if ( ![ '0', '1' ].includes( paid_in_out.paid_in ) ) {
                    reject( new Error( 'Invalid type' ) );
                    
                } else {
                    resolve( paid_in_out );
                    
                };
            });
        };
        function getHoldingCheckUser( paid_in_out ) {
            return new Promise( ( resolve, reject ) => {
                Promise.all([
                    fn.holdings.find( { holding_id: paid_in_out.holding_id } ),
                    fn.users.find(    { user_id:    paid_in_out.user_id_paid_in_out } )
                ])
                .then( results => resolve( [ paid_in_out, results[0] ] ) )
                .catch( reject );
            });
        };
        function createPaidInOut( [ paid_in_out, holding ] ) {
            return new Promise( ( resolve, reject ) => {
                m.paid_in_outs.create({
                    ...paid_in_out,
                    user_id: user_id
                })
                .then( paid_in_out => {
                    createAction( paid_in_out.paid_in_out_id, 'CREATED', user_id )
                    .then( result => resolve( [ paid_in_out, holding ] ) );
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            if ( paid_in_out ) {
                check( paid_in_out )
                .then( getHoldingCheckUser )
                .then( createPaidInOut )
                .then( ( [ paid_in_out, holding ] ) => {
                    if ( paid_in_out.paid_in === '1' ) {
                        holding.increment( 'cash', { by: paid_in_out.amount } )
                        .then( result => {
                            markComplete( paid_in_out, user_id, holding.holding_id )
                            .then( result => resolve( true ) );
                        })
                        .catch( reject );

                    } else {
                        resolve( true );

                    };
                })
                .catch( reject );

            } else {
                reject(new Error('No details'));
            };
        });
    };

    fn.paid_in_outs.complete = function ( paid_in_out_id, user_id ) {
        function checkPaidInOut() {
            return new Promise( ( resolve, reject ) => {
                m.paid_in_outs.findOne({
                    where: { paid_in_out_id: paid_in_out_id }
                })
                .then( fn.rejectIfNull )
                .then( paid_in_out => {
                    if ( paid_in_out.paid_in ) {
                        reject( new Error( 'This is a pay in' ) );
        
                    } else if ( paid_in_out.status === 0 ) {
                        reject( new Error( 'This pay out has been cancelled' ) );
        
                    } else if ( paid_in_out.status === 2 ) {
                        reject( new Error( 'This pay out is already complete' ) );
        
                    } else if ( paid_in_out.status === 1 ) {
                        if ( !paid_in_out.holding ) {
                            reject( new Error( 'Invalid holding' ) );
        
                        } else if ( Number( paid_in_out.holding.cash ) < Number(paid_in_out.amount ) ) {
                            reject( new Error( 'Not enough in holding' ) );
        
                        } else {
                            resolve( paid_in_out );
        
                        };
                    } else {
                        reject( new Error( 'Unknown status' ) );
        
                    };
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkPaidInOut()
            .then( paid_in_out => {
                paid_in_out.holding.decrement( 'cash', { by: paid_in_out.amount } )
                .then( result => {
                    markComplete( paid_in_out, user_id )
                    .then( resolve )
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
    
    fn.paid_in_outs.cancel = function ( paid_in_out_id, user_id ) {
        function check( paid_in_out ) {
            return new Promise( ( resolve, reject ) => {
                if ( paid_in_out.paid_in ) {
                    reject( new Error( 'This is a pay in' ) );
    
                } else if ( paid_in_out.status === 0 ) {
                    reject( new Error( 'This pay out has been cancelled' ) );
    
                } else if ( paid_in_out.status === 2 ) {
                    reject( new Error( 'This pay out is already complete' ) );
    
                } else if ( paid_in_out.status === 1 ) {
                    resolve( paid_in_out );
    
                } else {
                    reject( new Error( 'Unknown status' ) );
    
                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            m.paid_in_outs.find( {where: { paid_in_out_id: paid_in_out_id } } )
            .then( fn.rejectIfNull )
            .then( check )
            .then( paid_in_out => {
                markCancelled( paid_in_out.paid_in_out_id, user_id )
                .then( result => resolve( true ) )
                .catch( reject );
            })
            .catch( reject );
        });
    };
};