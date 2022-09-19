module.exports = function (m) {
    m.orders.hasOne(
        m.sizes,
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id',
            constraints: false
        }
    );
    
    m.orders.hasMany(
        m.issues,
        {
            foreignKey: 'order_id',
            targetKey:  'order_id'
        }
    );

    m.orders.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};