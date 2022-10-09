module.exports = function (m) {
    m.sales.hasMany(
        m.sale_lines,
        {
            foreignKey: 'sale_id',
            targetKey:  'sale_id',
            as: 'lines'
        }
    );
    
    m.sales.hasMany(
        m.payments,
        {
            foreignKey: 'sale_id',
            targetKey:  'sale_id'
        }
    );
    
    m.sales.belongsTo(
        m.sessions,
        {
            foreignKey: 'session_id',
            targetKey:  'session_id'
        }
    );
    
    m.sales.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
    
    m.sale_lines.hasOne(
        m.sales,
        {
            foreignKey: 'sale_id',
            sourceKey:  'sale_id',
            constraints: false
        }
    );
    
    m.sale_lines.hasOne(
        m.canteen_items,
        {
            foreignKey: 'item_id',
            sourceKey:  'item_id',
            as: 'item',
            constraints: false
        }
    );
};