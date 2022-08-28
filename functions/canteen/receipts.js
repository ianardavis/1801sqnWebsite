module.exports = function (m, fn) {
    fn.receipts = {};
    function create_check(receipt) {
        return new Promise((resolve, reject) => {
            if      (!receipt.qty)  reject(new Error('No quantity submitted'))
            else if (!receipt.cost) reject(new Error('No cost submitted'))
            else resolve(true);
        });
    };
    function create_action(action, receipt_id, user_id, links = []) {
        return new Promise(resolve => {
            fn.actions.create(
                `RECEIPTS | ${action}`,
                user_id,
                [{table: 'receipts', id: receipt_id}].concat(links)
            )
            .then(action => resolve(true));
        });
    };
    function create_receipt(item, receipt, user_id) {
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
                .catch(err => {
                    reject(err);
                });
            })
            .catch(err => reject(err));
        });
    };
    function check_item_qty(item, user_id) {
        return new Promise((resolve, reject) => {
            if (item.qty < 0) {
                item.update({qty: 0})
                .then(result => {
                    if (result) {
                        m.notes.create({
                            _table:  'canteen_items',
                            id:      item.item_id,
                            note:    'Item quantity below 0. Reset to 0 on receipt',
                            system:  1,
                            user_id: user_id
                        })
                        .then(note => resolve(true))
                        .catch(err => {
                            console.log(err);
                            resolve(true);
                        })
                    } else reject(new Error('Item quantity not updated'));
                })
                .catch(err => reject(err));
            } else resolve(true);
        });
    };
    function check_item_cost(original_qty, item, receipt) {
        return new Promise(resolve => {
            if (item.cost !== receipt.cost) {
                let stock_value_original = original_qty * item   .cost;
                let stock_value_received = receipt .qty * receipt.cost;
                let total_qty = original_qty + receipt.qty;
                let cost_new = Number((stock_value_original + stock_value_received) / total_qty);
                item.update({cost: cost_new})
                .then(result => {
                    if (result) {
                        fn.notes.create(
                            'canteen_items',
                            user_id,
                            item.item_id,
                            `Item cost updated from £${item.cost.toFixed(2)} to £${cost_new.toFixed(2)} by receipt`
                        )
                        .then(note => resolve(true))
                        .catch(err => {
                            console.log(err);
                            resolve(false);
                        });
                    } else {
                        console.log('Item cost not updated');
                        resolve(true);
                    };
                })
                .catch(err => resolve(true))
            } resolve(true);
        });
    };
    fn.receipts.create = function (receipt, user_id) {
        return new Promise((resolve, reject) => {
            create_check(receipt)
            .then(result => {
                fn.canteen_items.get(receipt.item_id)
                .then(item => {
                    check_item_qty(item, user_id)
                    .then(result => {
                        let qty_original = (item.qty < 0 ? 0 : item.qty);
                        create_receipt(item, receipt, user_id)
                        .then(receipt => {
                            check_item_cost(qty_original, item, receipt)
                            .then(result => resolve(true));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};