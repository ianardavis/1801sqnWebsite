module.exports = function (m, fn) {
    fn.receipts = {};
    fn.receipts.get = function (where) {
        return fn.get(
            m.receipts,
            where,
            [
                fn.inc.users.user(),
                fn.inc.canteen.item()
            ]
        );
    };
    fn.receipts.get_all = function (query) {
        return new Promise((resolve, reject) => {
            m.receipts.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.users.user(),
                    fn.inc.canteen.item()
                ],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    
    fn.receipts.create = function (receipts, user_id) {
        function create_receipt(receipt, user_id) {
            function check(receipt) {
                return new Promise((resolve, reject) => {
                    if (!receipt.qty) {
                        reject(new Error('No quantity submitted'));
        
                    } else if (!receipt.cost) {
                        reject(new Error('No cost submitted'));
        
                    } else {
                        resolve(receipt);
        
                    };
                });
            };
            function check_item_qty(item, user_id) {
                return new Promise((resolve, reject) => {
                    if (item.qty < 0) {
                        fn.update(item, {qty: 0})
                        .then(result => {
                            m.notes.create({
                                _table:  'canteen_items',
                                id:      item.item_id,
                                note:    'Item quantity below 0. Reset to 0 on receipt',
                                system:  1,
                                user_id: user_id
                            })
                            .then(note => resolve(true))
                            .catch(err => {
                                console.error(err);
                                resolve(true);
                            });
                        })
                        .catch(reject);
                    } else {
                        resolve(true);
                    };
                });
            };
            function create_receipt_entry(item, receipt, user_id) {
                function create_action(action, receipt_id, user_id) {
                    return new Promise(resolve => {
                        fn.actions.create([
                            `RECEIPTS | ${action}`,
                            user_id,
                            [{_table: 'receipts', id: receipt_id}]
                        ])
                        .then(action => resolve(true));
                    });
                };
                return new Promise((resolve, reject) => {
                    m.receipts.create({
                        item_id: item.item_id,
                        qty:     receipt.qty,
                        cost:    receipt.cost,
                        user_id: user_id
                    })
                    .then(receipt => {
                        item.increment('qty', {by: Number(receipt.qty)})
                        .then(result => {
                            create_action('CREATED', receipt.receipt_id, user_id)
                            .then(result => resolve(receipt));
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                });
            };
            function check_item_cost(original_qty, item, receipt) {
                return new Promise(resolve => {
                    if (item.cost !== receipt.cost) {
                        const stock_value_original = original_qty * item   .cost;
                        const stock_value_received = receipt .qty * receipt.cost;
                        const total_qty = original_qty + receipt.qty;
                        const cost_new = Number((stock_value_original + stock_value_received) / total_qty);
                        fn.update(item, {cost: cost_new})
                        .then(result => {
                            fn.notes.create(
                                'canteen_items',
                                user_id,
                                item.item_id,
                                `Item cost updated from £${item.cost.toFixed(2)} to £${cost_new.toFixed(2)} by receipt`
                            )
                            .then(note => resolve(true))
                            .catch(err => {
                                console.error(err);
                                resolve(false);
                            });
                        })
                        .catch(err => resolve(true))
                    } resolve(true);
                });
            };
            return new Promise((resolve, reject) => {
                check(receipt)
                .then(receipt => {
                    fn.canteen_items.get({item_id: receipt.item_id})
                    .then(item => {
                        check_item_qty(item, user_id)
                        .then(result => {
                            let qty_original = (item.qty < 0 ? 0 : item.qty);
                            create_receipt_entry(item, receipt, user_id)
                            .then(receipt => {
                                check_item_cost(qty_original, item, receipt)
                                .then(result => resolve(true));
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            if (receipts) {
                let actions = [];
                receipts.forEach(receipt => {
                    actions.push(
                        create_receipt(
                            receipt,
                            user_id
                        )
                    );
                });
                Promise.allSettled(actions)
                .then(fn.log_rejects)
                .then(results => {
                    const failed_qty = results.filter(e => e.status === 'rejected').length;
                    if (failed_qty > 0) {
                        reject(new Error(`${failed_qty} lines failed`));
    
                    } else {
                        resolve(true);
                    
                    };
                })
                .catch(reject);
    
            } else {
                reject(new Error('No items submitted'));
                
            };
        });
    };
};