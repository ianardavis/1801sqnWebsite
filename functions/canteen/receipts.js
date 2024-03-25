module.exports = function ( m, fn ) {
    fn.receipts = {};
    fn.receipts.find = function ( where ) {
        return fn.find(
            m.receipts,
            where,
            [
                {
                    model:      m.users,
                    include:    [ m.ranks ],
                    attributes: fn.users.attributes.slim(),
                    as:         'user'
                },
                { model: m.canteen_items, include:  include, as: 'item' }
            ]
        );
    };
    fn.receipts.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.receipts.findAndCountAll({
                where: query.where,
                include: [
                    {
                        model:      m.users,
                        include:    [ m.ranks ],
                        attributes: fn.users.attributes.slim(),
                        as:         'user'
                    },
                    { model: m.canteen_items, include:  include, as: 'item' }
                ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };
    
    fn.receipts.create = function ( receipts, user_id ) {
        function receiveStock( receipt ) {
            function checkReceiptDetails() {
                return new Promise( ( resolve, reject ) => {
                    if ( !receipt.qty ) {
                        reject( new Error( 'No quantity submitted' ) );
        
                    } else if ( !receipt.cost ) {
                        reject( new Error( 'No cost submitted' ) );
        
                    } else {
                        resolve( receipt );
        
                    };
                });
            };
            function checkItemQty( item ) {
                function setQtyToZero() {
                    return new Promise( ( resolve, reject ) => {
                        item.update( { qty: 0 } )
                        .then( fn.checkResult )
                        .then( item.reload )
                        .then( item => {
                            m.notes.create({
                                _table:  'canteen_items',
                                id:      item.item_id,
                                note:    'Item quantity below 0. Reset to 0 on receipt',
                                system:  1,
                                user_id: user_id
                            })
                            .then( note => resolve( item ) )
                            .catch( err => {
                                console.error( err );
                                resolve( item );
                            });
                        })
                        .catch( reject );
                    })
                };
                return new Promise( ( resolve, reject ) => {
                    if ( item.qty < 0 ) {
                        setQtyToZero()
                        .then( resolve )
                        .catch( reject );
                    } else {
                        resolve( [ item, item.qty] );
                    };
                });
            };
            function createReceipt( [ item, originalQty ] ) {
                return new Promise( ( resolve, reject ) => {
                    m.receipts.create({
                        item_id: item.item_id,
                        qty:     receipt.qty,
                        cost:    receipt.cost,
                        user_id: user_id
                    })
                    .then( receipt => {
                        item.increment( 'qty', { by: Number( receipt.qty ) } )
                        .then( result => {
                            fn.actions.create([
                                `RECEIPT | CREATED`,
                                user_id,
                                [ { _table: 'receipts', id: receipt.receipt_id } ]
                            ])
                            .then( result => resolve( [ item, receipt, originalQty ] ) );
                        })
                        .catch( reject );
                    })
                    .catch( reject );
                });
            };
            function checkItemCost( [ item, receipt, originalQty ] ) {
                return new Promise( resolve => {
                    if ( item.cost !== receipt.cost ) {
                        const valueOriginal = originalQty * item.cost;
                        const valueReceived = receipt.qty * receipt.cost;
                        const totalQty = originalQty + receipt.qty;
                        const newCost = Number( ( valueOriginal + valueReceived ) / totalQty );
                        
                        item.update( { cost: newCost } )
                        .then( fn.checkResult )
                        .then( result => {
                            fn.notes.create(
                                'canteen_items',
                                user_id,
                                item.item_id,
                                `Item cost updated from £${ item.cost.toFixed(2) } to £${ newCost.toFixed(2) } by receipt`
                            )
                            .then( note => resolve( true ) )
                            .catch( err => {
                                console.error( err );
                                resolve( false );
                            });
                        })
                        .catch( err => {
                            console.error( err )
                            resolve( false );
                        })
                    } else {
                        resolve( true );

                    };
                });
            };
            return new Promise( ( resolve, reject ) => {
                checkReceiptDetails()
                .then( receipt => {
                    m.canteen_items.find( { where: { item_id: receipt.item_id } } )
                    .then( fn.rejectIfNull )
                    .then( checkItemQty )
                    .then( createReceipt )
                    .then( checkItemCost )
                    .then( result => resolve( true ) )
                    .catch( reject );
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            if (receipts) {
                // let actions = [];
                // receipts.forEach(receipt => {
                //     actions.push(
                //         receiveStock( receipt )
                //     );
                // });
                // Promise.allSettled(actions)
                Promise.allSettled(receipts.map(receiveStock))
                .then(fn.logRejects)
                .then(results => {
                    const failed_qty = results.filter(e => e.status === 'rejected').length;
                    if (failed_qty > 0) {
                        reject(new Error(`${failed_qty} lines failed`));
    
                    } else {
                        resolve(true);
                    
                    };
                })
                .catch( reject );
    
            } else {
                reject(new Error('No items submitted'));
                
            };
        });
    };
};