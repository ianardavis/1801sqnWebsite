module.exports = function (m) {
    m.sizes.belongsTo(
        m.items,
        {
            foreignKey: 'item_id',
            targetKey:  'item_id'
        }
    );
    
    m.sizes.belongsTo(
        m.scrap_lines,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.sizes.hasMany(
        m.issues,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.sizes.hasMany(
        m.orders,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.sizes.hasMany(
        m.demand_lines,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id',
            as: 'demands'
        }
    );
    
    m.sizes.hasMany(
        m.stocks,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.sizes.hasMany(
        m.serials,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.sizes.hasMany(
        m.details,
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id'
        }
    );
    
    m.sizes.hasMany(
        m.nsns,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.sizes.hasOne(
        m.nsns,
        {
            foreignKey: 'nsn_id',
            targetKey:  'nsn_id',
            constraints: false
        }
    );
    
    m.sizes.hasOne(
        m.suppliers,
        {
            foreignKey: 'supplier_id',
            sourceKey:  'supplier_id',
            constraints: false
        }
    );
};