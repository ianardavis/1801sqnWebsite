module.exports = function (m) {
    m.payments.belongsTo(
        m.sales,
        {
            foreignKey: 'sale_id',
            targetKey:  'sale_id'
        }
    );
    
    m.payments.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};