module.exports = function (m, fn) {
    fn.receipts = {};
    fn.receipts.create = function (receipt, user_id) {
        return new Promise((resolve, reject) => {
            if      (!receipt.qty)  reject(new Error('No quantity submitted'))
            else if (!receipt.cost) reject(new Error('No cost submitted'))
            else {
                return fn.get(
                    'canteen_items',
                    {item_id: receipt.item_id}
                )
                .then(item => {
                    return m.receipts.create({
                        item_id: item.item_id,
                        qty:     receipt.qty,
                        cost:    receipt.cost,
                        user_id: user_id
                    })
                    .then(receipt => {
                        let receipt_qty = Number(receipt.qty);
                        if (item.qty < 0) {
                            receipt_qty += Math.abs(item.qty);
                            m.notes.create({
                                _table:  'canteen_items',
                                id:      item.item_id,
                                note:    `Current quantity below 0. Increased by ${Math.abs(item.qty)} on receipt`,
                                system:  1,
                                user_id: user_id
                            });
                        };
                        let qty_current = (item.qty < 0 ? 0 : item.qty)
                        return item.increment('qty', {by: receipt_qty})
                        .then(result => {
                            if (!result) reject(new Error('Item quantity not updated'))
                            else {
                                if (item.cost !== receipt.cost) {
                                    let cost_new    = Number(((qty_current * item.cost) + (receipt.qty * receipt.cost)) / (qty_current + receipt.qty));
                                    return item.update({cost: cost_new})
                                    .then(result => {
                                        if (!result) resolve(true);
                                        else {
                                            m.notes.create({
                                                _table:  'canteen_items', 
                                                id:      item.item_id,
                                                note:    `Item cost updated from £${item.cost.toFixed(2)} to £${cost_new.toFixed(2)} by receipt`,
                                                system:  1,
                                                user_id: user_id
                                            })
                                            .then(note => resolve(true))
                                            .catch(err => resolve(true))
                                        };
                                    })
                                    .catch(err => resolve(true))
                                } else resolve(true);
                            };
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        })
    };
};