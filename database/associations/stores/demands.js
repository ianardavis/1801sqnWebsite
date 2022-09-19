module.exports = function (m) {
    m.demands.belongsTo(
        m.suppliers,
        {
            foreignKey: 'supplier_id',
            sourceKey:  'supplier_id'
        }
    );
    
    m.demands.hasMany(
        m.demand_lines,
        {
            foreignKey: 'demand_id',
            targetKey:  'demand_id',
            as: 'lines'
        }
    );
    
    m.demand_lines.hasOne(
        m.sizes,
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id',
            constraints: false
        }
    );
    
    m.demand_lines.belongsTo(
        m.demands,
        {
            foreignKey: 'demand_id',
            targetKey:  'demand_id'
        }
    );

    m.demands.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );

    m.demand_lines.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};