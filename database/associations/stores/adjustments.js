module.exports = function (m) {
    m.adjustments.hasOne(
        m.stocks,
        {
            foreignKey: 'stock_id',
            sourceKey:  'stock_id',
            constraints: false
        }
    );

    m.adjustments.hasOne(
        m.sizes,
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id',
            constraints: false
        }
    );

    m.adjustments.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};