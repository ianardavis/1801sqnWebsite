module.exports = function ( m, fn ) {
    fn.sales = { lines: {}, payments: {} };
    fn.sales.find = function ( where ) {
        return fn.find(
            m.sales,
            where,
            [
                { model: m.sessions,   as: 'session' },
                { model: m.sale_lines, as: 'lines' },
                fn.inc.users.user()
            ]
        );
    };
    fn.sales.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.sales.findAndCountAll({
                where: query.where,
                include: [
                    {
                        model: m.sale_lines,
                        include: [ { model: m.canteen_items, as: 'item' } ],
                        as: 'lines'
                    },
                    fn.inc.users.user()
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.sales.findCurrent = function ( user_id ) {
        return new Promise( ( resolve, reject ) => {
            fn.sessions.findCurrent()
            .then(session => {
                m.sales.findOrCreate({
                    where: {
                        session_id: session.session_id,
                        user_id:    user_id,
                        status:     1
                    }
                })
                .then( ( [ sale, created ] ) => resolve( sale.sale_id ) )
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.sales.lines.find = function ( line_id ) {
        return new Promise( ( resolve, reject ) => {
            m.sale_lines.findOne({
                where: { line_id: line_id },
                include: [ fn.inc.canteen.sale( { session: true } ) ]
            })
            .then( fn.rejectIfNull )
            .then( resolve )
            .catch( reject );
        });
    };
    fn.sales.lines.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.sale_lines.findAndCountAll({
                where:   query.where,
                include: [ { model: m.canteen_items, as: 'item' } ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.sales.complete = function ( sale_id, saleDetails, user_id ) {
        function checkSale() {
            return new Promise ( ( resolve, reject ) => {
                m.sales.find( {
                    where: { sale_id: sale_id },
                    include: [{
                        model: m.sale_lines,
                        include: [ { model: m.canteen_items, as: 'item' } ],
                        as: 'lines'
                    }]
                })
                .then( fn.rejectIfNull )
                .then( sale => {
                    switch ( sale.status ) {
                        case 0:
                            reject( new Error( 'Sale has been cancelled' ) );
                            break;
    
                        case 1:
                            resolve( sale );
                            break;
    
                        case 2:
                            reject( new Error( 'Sale has already been completed' ) );
                            break;
                    
                        default:
                            reject( new Error( 'Unknown sale status' ) );
                            break;
                    };
                })
                .catch( reject );
            });
        };
        function processCashTendered(sale) {
            return new Promise ( ( resolve, reject ) => {
                if ( saleDetails.tendered && saleDetails.tendered > 0 ) {
                    fn.payments.create(
                        sale.sale_id,
                        saleDetails.tendered,
                        user_id,
                        {
                            ...( saleDetails.user_id_payment ? { user_id_payment: saleDetails.user_id_payment } : {} )
                        }
                    )
                    .then( payment => resolve( sale ) )
                    .catch( reject );

                } else {
                    resolve ( sale );

                };
            });
        };
        function checkPayments( sale ) {
            function getSaleTotal() {
                return new Promise( ( resolve, reject ) => {
                    if ( sale.lines.length === 0 ) {
                        reject( new Error( 'No lines on this sale' ) );

                    } else {
                        const total = sale.lines.reduce( ( running, line ) => running += ( line.qty * line.price ))
                        // lines.forEach( line => { total += ( line.qty * line.price ) } );
                        resolve( total );

                    };
                });
            };
            function getPayments() {
                return new Promise( ( resolve, reject ) => {
                    m.payments.sum( 'amount', { where: { sale_id: sale.sale_id } } )
                    .then( resolve )
                    .catch( reject );
                });
            };
            function processAccountPayment( user_id_debit, balance ) {
                function debitAccount( sale_id, account, amount ) {
                    return new Promise( ( resolve, reject ) => {
                        account.decrement( 'credit', { by: amount } )
                        .then( result => {
                            fn.payments.create(
                                sale_id,
                                amount,
                                user_id,
                                {
                                    type: 'Account',
                                    user_id_payment: account.user_id
                                }
                            )
                            .then( result => resolve( true ) )
                            .catch( reject );
                        })
                        .catch( reject );
                    });
                };
                return new Promise( ( resolve, reject ) => {
                    fn.credits.find( { credit_id: user_id_debit } )
                    .then( account => {
                        if ( balance <= account.credit ) {
                            debitAccount( sale.sale_id, account, balance )
                            .then( result => resolve( true ) )
                            .catch( reject );
                        } else {
                            debitAccount( sale.sale_id, account, account.credit )
                            .then( result => resolve( true ) )
                            .catch( reject );
                        };
                    })
                    .catch( reject );
                });
            };
            return new Promise( ( resolve, reject ) => {
                Promise.all([
                    getPayments(), // Check total payments made
                    getSaleTotal()
                ])
                .then( ( [ paid, saleTotal]) => {
                    let balance = Number( saleTotal - paid );

                    // Total paid is equal or more than required
                    if ( balance <= 0 ) {
                        resolve( sale, Math.abs( balance ) );

                    // Not enough payments yet, a user has been specified to debit from
                    } else if ( saleDetails.user_id_debit ) { 
                        processAccountPayment( saleDetails.user_id_debit, balance)
                        .then( result => {
                            //Check total payments made AGAIN
                            getPayments()
                            .then( paid => {
                                balance = Number( saleTotal - paid );

                                if ( balance <= 0 ) {
                                    resolve( sale, Math.abs( balance ) );
        
                                } else {
                                    reject( new Error( 'Not enough tendered or in credit' ) );

                                };
                            })
                            .catch( reject );
                        })
                        .catch( reject )

                    // Not enough payments, no user has been specified to debit from
                    } else {
                        reject( new Error( 'Not enough tendered, no user to debit from' ) );

                    };
                })
                .catch( reject );
            });
        };
        function confirmPayments( [ sale, change ] ) {
            return new Promise( ( resolve, reject ) => {
                m.payments.update( { status: 2 }, { where: { sale_id: sale.sale_id, status: 1 } } )
                .then( fn.checkResult )
                .then( result => resolve( [ sale, change ] ) )
                .catch( reject );
            });
        };
        function creditAccount( [ sale, change ] ) {
            return new Promise(resolve => {
                if ( saleDetails.user_id_credit && change > 0 ) {
                    m.credits.findOrCreate({
                        where:    { user_id: saleDetails.user_id_credit },
                        defaults: { credit:  change }
                    })
                    .then( ( [ credit, created ] ) => {
                        if ( created ) {
                            resolve( [ sale, 0 ] );
    
                        } else {
                            credit.increment( 'qty', { by: change } )
                            .then( result => resolve( [ sale, 0 ] ) )
                            .catch(err => {
                                console.error( err )
                                resolve( [ sale, change ] );
                            });
                        };
                    })
                    .catch( err => {
                        console.error( err )
                        resolve( [ sale, change ] );
                    });

                } else {
                    resolve( [ sale, change ] );
                    
                };
            });
        };
        function processSoldStock( [ sale, change ] ) {
            function subtractSoldQtyFromStock( { item_id, qty } ) {
                return new Promise( ( resolve, reject ) => {
                    fn.canteen_items.find( { item_id: item_id } )
                    .then( item => {
                        item.decrement( 'qty', { by: qty } )
                        .then( result => resolve( true ) )
                        .catch( reject );
                    })
                    .catch( reject );
                });
            };
            return new Promise ( ( resolve, reject ) => {
                Promise.all(sale.lines.map(subtractSoldQtyFromStock))
                .then(result => resolve( [ sale, change ] ) )
                .catch( reject );
            });
        };
        function closeSale( [ sale, change ]) {
            return new Promise ( ( resolve, reject ) => {
                sale.update( { status: 2 } )
                .then( fn.checkResult )
                .then(result => resolve( change ) )
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkSale()
            .then( processCashTendered )
            .then( checkPayments )
            .then( confirmPayments )
            .then( creditAccount )
            .then( processSoldStock )
            .then( closeSale )
            .then( resolve )
            .catch( reject );
        });
    };

    fn.sales.lines.create = function ( ean, sale_id ) {
        function checkSale( sale_id ) {
            return new Promise( ( resolve, reject ) => {
                m.sales.findOne({
                    where: { sale_id: sale_id },
                    include: [ { model: m.sessions, as: 'session' } ]
                })
                .then( sale => {
                    if ( !sale.session ) {
                        reject( new Error( 'Session not found' ) );
    
                    } else if ( sale.session.status !== 1 ) {
                        reject( new Error( 'Session for this sale is not open' ) );
    
                    } else {
                        resolve( sale );
    
                    };
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            Promise.all([
                checkSale( sale_id ),
                fn.canteen_items.findByEAN( ean )
            ])
            .then( ( [ sale, item ] ) => {
                m.sale_lines.findOrCreate({
                    where: {
                        sale_id: sale.sale_id,
                        item_id: item.item_id
                    },
                    defaults: {
                        qty:   1,
                        price: item.price
                    }
                })
                .then( ( [ line, created ] ) => {
                    if ( created ) {
                        resolve( true );

                    } else {
                        line.increment( 'qty', { by: 1 } )
                        .then( result => resolve( true ) )
                        .catch( reject );

                    };
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.sales.lines.edit = function (line) {
        function checkLine() {
            return new Promise( ( resolve, reject ) => {
                if (line) {
                    m.sale_lines.findOne({
                        where: { line_id: line.line_id },
                        include: [{
                            model: m.sales,
                            include: [ { model: m.sessions, as: 'session' } ],
                            as: 'sale'
                        }]
                    })
                    .then ( fn.rejectIfNull )
                    .then( foundLine => {
                        if ( !foundLine.sale ) {
                            reject( new Error( 'Sale not found' ) );
        
                        } else if ( !foundLine.sale.session ) {
                            reject( new Error( 'Session not found' ) );
        
                        } else if ( foundLine.sale.session.status !== 1 ) {
                            reject( new Error( 'Session for this sale is not open' ) );
        
                        } else {
                            resolve( [ foundLine, line.qty ] );
        
                        };
                    })
                    .catch( reject );
                    
                } else {
                    reject( new Error( 'No line' ) );

                };
            });
        };
        function increaseQty( foundLine ) {
            return new Promise( ( resolve, reject ) => {
                foundLine.increment( 'qty', { by: line.qty } )
                .then( updatedLine => resolve( updatedLine ) )
                .catch( reject );
            });
        };
        function deleteIfQtyZero ( updatedLine ) {
            return new Promise( ( resolve, reject ) => {
                if (updatedLine.qty <= 0) {
                    updatedLine.destroy()
                    .then( fn.checkResult )
                    .then( resolve );

                } else {
                    resolve( true );
    
                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkLine()
            .then( increaseQty )
            .then( deleteIfQtyZero )
            .then( resolve( true ) )
            .catch( reject );
        });
    };

    fn.sales.payments.delete = function ( payment_id ) {
        return new Promise( ( resolve, reject ) => {
            fn.payments.find( { payment_id: payment_id } )
            .then( payment => {
                switch (payment.status) {
                    case 0:
                        reject( new Error( 'Payment has been cancelled' ) );
                        break;
                
                    case 1:
                        payment.destroy()
                        .then( fn.checkResult )
                        .then( resolve )
                        .catch( reject );
                        break;
            
                    case 2:
                        reject( new Error( 'Payment has already been confirmed' ) );
                        break;
                
                    default:
                        reject( new Error( 'Unknown payment status' ) );
                        break;
                };
            })
            .catch( reject );
        });
    };
};