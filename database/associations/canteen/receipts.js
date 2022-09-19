module.exports = function (m) {
    m.receipts.hasOne(
        m.canteen_items,
        {
            foreignKey: 'item_id',
            sourceKey:  'item_id',
            as: 'item',
            constraints: false
        }
    );
    
    m.receipts.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};