module.exports = function (m) {
    m.canteen_receipts.hasOne(
        m.canteen_items,
        {
            foreignKey: 'item_id',
            sourceKey:  'item_id',
            as: 'item',
            constraints: false
        }
    );
    
    m.canteen_receipts.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};