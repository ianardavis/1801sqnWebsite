module.exports = function ( m, fn ) {
    const line_status = {
        0: "Cancelled",
        1: "Pending",
        2: "Open",
        3: "Closed"
    };
    function createLineAction( action, line_id, user_id, links = [] ) {
        return new Promise(resolve => {
            fn.actions.create([
                `DEMAND LINE | ${ action }`,
                user_id,
                [ { _table: 'demand_lines', id: line_id } ].concat( links )
            ])
            .then( action => resolve( true ) )
            .catch( err => {
                console.error( err );
                resolve( false )
            });
        });
    };
    fn.demands.lines.count = function ( where ) { return m.demand_lines.count( { where: where } ) };
    fn.demands.lines.sum   = function ( where ) { return m.demand_lines.sum( 'qty', { where: where } ) };
    fn.demands.lines.find  = function ( where, include = [] ) {
        return fn.find(
            m.demand_lines,
            where,
            [
                fn.inc.stores.demand(), 
                fn.inc.stores.size()
            ].concat( include )
        );
    };
    fn.demands.lines.findAndCountAll = function ( where, pagination ) {
        return new Promise( ( resolve, reject ) => {
            m.demand_lines.findAndCountAll({
                where: where,
                include: [
                    fn.inc.stores.size(),
                    fn.inc.users.user(),
                    fn.inc.stores.demand(),
                    fn.inc.stores.orders()
                ],
                ...pagination
            })
            .then( resolve )
            .catch( reject );
        });
    };
    fn.demands.lines.findAll = function ( where = {}, include = [], options = {} ) {
        return new Promise( ( resolve, reject ) => {
            m.demand_lines.findAll({
                where:   where,
                include: include
            })
            .then( lines => {
                if (
                    options.allowNull === true ||
                    ( lines && lines.length > 0 )
                ) {
                    resolve( lines );

                } else {
                    reject( new Error( 'No lines found' ) );

                };
            })
            .catch( reject );
        });
    };

    fn.demands.lines.create = function ( size_id, demand_id, user_id, orders = [] ) {
        function checkSize( size_id ) {
            return new Promise( ( resolve, reject ) => {
                m.sizes.findOne({
                    where: { size_id: size_id },
                    include: [{
                        model: m.details,
                        where: { name: { [ fn.op.or ]: [ 'Demand Page', 'Demand Cell' ] } }
                    }]
                })
                .then( fn.rejectIfNull )
                .then( size => {
                    if ( !size.details ) {
                        reject( new Error( 'No demand page/cell for this size' ) );
    
                    } else if ( !size.details.filter( e => e.name === 'Demand Page' ) ) {
                        reject( new Error( 'No demand page for this size' ) );
    
                    } else if ( !size.details.filter(e => e.name === 'Demand Cell' ) ) {
                        reject( new Error( 'No demand cell for this size' ) );
    
                    } else {
                        resolve( size );
    
                    };
                })
                .catch( reject );
            });
        };
        function checkDemand( size ) {
            return new Promise( ( resolve, reject ) => {
                m.demands.findOne({
                    where: { demand_id: demand_id }
                })
                .then( fn.rejectIfNull )
                .then( demand => {
                    if ( demand.status !== 1 ) {
                        reject( new Error( 'Lines can only be added to draft demands' ) );
    
                    } else if ( size.supplier_id !== demand.supplier_id ) {
                        reject( new Error( 'Size and demand are not for the same supplier' ) );
    
                    } else {
                        resolve( [ demand.demand_id, size.size_id ] );
    
                    };
                })
                .catch( reject );
            });
        };
        function createLine( [ demand_id, size_id ] ) {
            return new Promise( ( resolve, reject ) => {
                m.demand_lines.findOrCreate({
                    where: {
                        demand_id: demand_id,
                        size_id:   size_id
                    },
                    defaults: {
                        user_id: user_id
                    }
                })
                .then( ( [ line, created ] ) => {
                    let actions = [];
                    orders.forEach( order => {
                        actions.push( m.order_demand_lines.create({
                            order_id: order.order_id,
                            line_id:  line.line_id
                        }));
                    });
                    Promise.all( actions )
                    .then( results => {
                        let links = [];
                        orders.forEach( e => links.push( { _table: 'orders', id: e.order_id } ) );
                        resolve([
                            `DEMAND LINE | ${ ( created ? 'CREATED' : 'INCREMENTED' ) }`,
                            user_id,
                            [ { _table: 'demand_lines', id: line.line_id } ].concat( links )
                            [ line.line_id, created ],
                            line.line_id
                        ]);
                    })
                    .catch( reject );
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            checkSize( size_id, demand_id, user_id, orders )
            .then( checkDemand )
            .then( createLine )
            .then( fn.actions.create )
            .then( resolve )
            .catch( reject );
        });
    };
    fn.demands.lines.createBulk = function (lines, demand_id, user_id) {
        return new Promise( ( resolve, reject ) => {
            if ( !lines || lines.length === 0 ) {
                reject( new Error( 'No lines' ) );

            } else {
                Promise.all( 
                    lines.map( line => {
                        fn.demands.lines.create(
                            line.size_id,
                            demand_id,
                            line.qty,
                            user_id
                        )
                    })
                )
                .then( result => resolve( true ) )
                .catch( reject );

            };
        });
    };

    fn.demands.lines.update = function ( site_id, lines, user_id ) {
        return new Promise( ( resolve, reject ) => {
            if ( !lines || lines.length === 0 ) {
                fn.sendError( res, 'No lines submitted' );
    
            } else {                
                Promise.all([
                    // ...lines.filter(e => e.status === '-1').map(line => {
                    //     fn.demands.lines.restore(line.line_id, user_id)
                    // }),
                    ...lines.filter( e => e.status === '3' ).map( line => {
                        fn.demands.lines.receive( site_id, line, user_id );
                    }),
                    ...lines.filter( e => e.status === '0' ).map( line => {
                        fn.demands.lines.cancel( line.line_id, user_id );
                    })
                ])
                .then( results => resolve( true ) )
                .catch( reject );
                
            };
        });
    };
    
    fn.demands.lines.cancel = function ( line_id, user_id ) {
        function checkLine() {
            return new Promise( ( resolve, reject ) => {
                m.demands.lines.findOne({
                    where: { line_id: line_id },
                    include: [ m.orders ]
                })
                .then( fn.rejectIfNull )
                .then( line => {
                    if ( line.status !== 1 && line.status !== 2 ) {
                        reject( new Error( `This line is ${ line_status[ line.status ] }, only pending or open lines can be cancelled` ) );
    
                    } else {
                        resolve( line );
    
                    };
                })
                .catch( reject );
            });
        };
        function updateLine( line ) {
            return new Promise( ( resolve, reject ) => {
                line.update( { status: 0 } )
                .then( fn.checkResult )
                .then( result => resolve( line ) )
                .catch( reject );
            });
        };
        function updateOrders(  line ) {
            function changeOrderToPlaced( order ) {
                return new Promise( ( resolve, reject ) => {
                    if ( order.status === 3 ) {
                        order.update( { status: 2 } )
                        .then( fn.checkResult )
                        .then( result => resolve( order.order_id ) )
                        .catch( reject );

                    } else {
                        reject(new Error(`Non-allowed order status: ${order.status}`));

                    };
                });
            };
            return new Promise( ( resolve, reject ) => {
                Promise.allSettled(
                    line.orders.map(changeOrderToPlaced)
                )
                .then(results => {
                    resolve([
                        'DEMAND LINE | CANCELLED',
                        user_id,
                        [ 
                            { _table: 'demand_lines', id: line.line_id }
                        ].concat(
                            results.map( e => { return { _table: 'orders', id: e.value } } )
                        )
                    ]);
                })
                .catch( reject );
            });
        };
        return new Promise (( resolve, reject ) => {
            checkLine()
            .then( updateLine )
            .then( updateOrders )
            .then( fn.actions.create )
            .then( result => resolve( true ) )
            .catch( reject );
        });
    };

    fn.demands.lines.receive = function (site_id, details, user_id) {
        function checkLine() {
            return new Promise( ( resolve, reject ) => {
                m.demands.lines.findOne({
                    where: { line_id: details.line_id },
                    include: [
                        { model: m.sizes, as: 'size' },
                        { model: m.orders, where: { status: 2 } }
                    ]
                })
                .then( demand_line => {
                    if ( !demand_line.size ) {
                        reject( new Error( 'Size not found' ) );
    
                    } else {
                        resolve( demand_line );
    
                    };
                })
                .catch( reject );
            });
        };
        function receiveOrders( line ) {
            function receiveSerials( { serials } ) {
                return new Promise( ( resolve, reject ) => {
                    let actions = [];
                    for ( let { order_id, qty } of line.orders ) {
                        // Break loop if there are no more serials to receive
                        if ( serials.length === 0 ) break;

                        let receipt = { serials: [] };
                        
                        // loop order qty or serials submitted, whoch ever is the lowest
                        for ( let i = 0; i < Math.min( qty, serials.length ); i++ ) {
                            receipt.serials.push( serials.pop() );
                        };
                        actions.push(
                            fn.orders.receive(
                                site_id,
                                order_id,
                                receipt,
                                user_id,
                                [ { _table: 'demand_lines', id: line.line_id } ]
                            )
                        );
                    };
                    Promise.allSettled( actions )
                    .then( fn.logRejects )
                    .then( fn.fulfilledOnly )
                    .then( results => resolve( [ results, serials ] ) )
                    .catch( reject );
                });
            };
            function receiveStock( { qtyReceived, location } ) {
                return new Promise( ( resolve, reject ) => {
                    let qtyRemaining = Number( qtyReceived ) || 0;
                    let actions = []
                    for ( let { order_id, orderQty } of line.orders ) {
                        
                        // Break loop if no more stock to receive
                        if ( qtyRemaining <= 0 ) break;

                        let receipt = { location: location };
                        
                        // Receipt qty is order qty or qtyLeft, whichever is lower
                        receipt.qty = Math.min( orderQty, qtyRemaining );
                        
                        qtyRemaining -= receipt.qty;
                        actions.push(
                            fn.orders.receive(
                                site_id,
                                order_id,
                                receipt,
                                user_id,
                                [ { _table: 'demand_lines', id: line.line_id } ]
                            )
                        );
                    };
                    Promise.allSettled( actions )
                    .then( fn.logRejects )
                    .then( fn.fulfilledOnly )
                    .then( results => resolve( [ results, qtyRemaining ] ) )
                    .catch( reject );
                });
            };
            const sumValues = ( a, b ) => a + Number( b );

            return new Promise( ( resolve, reject ) => {
                const has_serials = ( line.size.has_serials );
                ( has_serials ? receiveSerials : receiveStock )
                action( details )
                .then( ( [ results, remaining ] ) => {

                    resolve({
                        demand_line: line,
                        qty:         Number( results.reduce( sumValues )),
                        remaining:   ( has_serials ? remaining : { qty: remaining, location: details.location } )
                    });
                })
                .catch( reject );
            });
        };
        function receiveRemaining( order_qty, size_id, line_id, receipt ) {
            return new Promise( ( resolve, reject ) => {
                if ( order_qty > 0 ) {
                    fn.orders.create(
                        site_id,
                        size_id,
                        order_qty,
                        user_id,
                    )
                    .then(order => {
                        fn.orders.receive(
                            site_id,
                            order.order_id,
                            receipt,
                            user_id,
                            [ { _table: 'demand_lines', id: line_id } ]
                        )
                        .then( resolve )
                        .catch( reject );
                    })
                    .catch( reject );
    
                } else {
                    resolve( 0 );
    
                };
            });
        };
        function checkReceiptVariance(demand_line, qty) {
            return new Promise( ( resolve, reject ) => {
                let qty_original = demand_line.qty;
                if (qty > qty_original) {
                    fn.update(demand_line, {qty: qty})
                    .then(result => {
                        createLineAction(
                            `UPDATED | Qty increased from ${qty_original} to ${qty} on receipt`,
                            demand_line.line_id,
                            user_id
                        )
                        .then(action => resolve({demand_line: demand_line}));
                    })
                    .catch( reject );

                } else if (qty < qty_original) {
                    m.demand_lines.create({
                        demand_id: demand_line.demand_id,
                        size_id:   demand_line.size_id,
                        qty:       qty,
                        status:    3,
                        user_id:   user_id
                    })
                    .then(new_line => {
                        demand_line.decrement('qty', {by: qty})
                        .then(result => {
                            createLineAction(
                                `UPDATED | Partial receipt | New demand line created for receipt qty | Existing demand line qty updated from ${qty_original} to ${qty_original - qty}`,
                                demand_line.line_id,
                                user_id,
                                [{_table: 'demand_lines', id: new_line.line_id}]
                            )
                            .then(action => resolve({demand_line: new_line}));
                        })
                        .catch( reject );
                    })
                    .catch( reject );

                } else {
                    resolve({demand_line: demand_line});
                    
                };
            });
        };
        // 
        return new Promise( ( resolve, reject ) => {
            checkLine()
            .then( receiveOrders )
            .then( ( { line, receiptQty, remaining } ) => {
                const hasSerials = line.size.has_serials
                let order_qty = Number( ( hasSerials ? remaining.length : remaining.qty ) );
                let receipt = ( 
                    hasSerials ? 
                        { serials: remaining } :
                        { 
                            qty:      remaining.qty,
                            location: details.location
                        }
                    );
                receiveRemaining(
                    order_qty,
                    line.size_id,
                    line.line_id,
                    receipt
                )
                .then( received => {
                    checkReceiptVariance( line, receiptQty + Number( received ) )
                    .then( variance_result => {
                        variance_result.demand_line.update( { status: 3 } )
                        .then( fn.checkResult )
                        .then( result => resolve( true ) )
                        .catch( reject );
                    })
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
};