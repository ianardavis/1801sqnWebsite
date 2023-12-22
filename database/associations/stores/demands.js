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

    m.demands.hasOne(
        m.accounts,
        {
            foreignKey: 'account_id',
            sourceKey:  'account_id',
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
    
    m.demand_lines.belongsToMany(
        m.orders, 
        {
            through: m.order_demand_lines,
            foreignKey:'line_id'
        }
    );
    
    m.demand_lines.hasMany(
        m.receipts,
        {
            foreignKey: 'line_id',
            targetKey:  'line_id'
        }
    );

    m.receipts.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey: 'user_id',
            constraints: false
        }
    );

    m.receipts.hasOne(
        m.serials,
        {
            foreignKey: 'serial_id',
            sourceKey: 'serial_id',
            constraints: false
        }
    );

    m.receipts.hasOne(
        m.stocks,
        {
            foreignKey: 'stock_id',
            sourceKey: 'stock_id',
            constraints: false
        }
    );

    m.receipts.hasOne(
        m.nsns,
        {
            foreignKey: 'nsn_id',
            sourceKey: 'nsn_id',
            constraints: false
        }
    );

    m.receipts.belongsTo(
        m.demand_lines,
        {
            foreignKey: 'line_id',
            sourceKey: 'line_id',
            as: 'line'
        }
    );
};