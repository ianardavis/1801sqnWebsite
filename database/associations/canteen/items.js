module.exports = function (m) {
    m.canteen_items.hasMany(
        m.sale_lines,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id',
            as: 'sales'
        }
    );
    
    m.canteen_items.hasMany(
        m.canteen_receipts,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id'
        }
    );
    
    m.canteen_items.hasMany(
        m.eans,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id'
        }
    );
    
    m.canteen_items.hasMany(
        m.writeoffs,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id'
        }
    );
    m.eans.belongsTo(
        m.items,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id'
        }
    );
};