module.exports = function (m) {
    m.stocks.belongsTo(
        m.sizes,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.stocks.hasOne(
        m.locations,
        {
            foreignKey: 'location_id',
            sourceKey:  'location_id',
            constraints: false
        }
    );
    
    m.stocks.hasMany(
        m.adjustments,
        {
            foreignKey: 'stock_id',
            targetKey:  'stock_id'
        }
    );
};