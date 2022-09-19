module.exports = function (m) {
    m.nsns.belongsTo(
        m.loancard_lines,
        {
            foreignKey: 'nsn_id',
            targetKey:  'nsn_id'
        }
    );
    
    m.nsns.belongsTo(
        m.scrap_lines,
        {
            foreignKey: 'nsn_id',
            targetKey:  'nsn_id'
        }
    );
    
    m.nsns.hasOne(
        m.nsn_groups,
        {
            foreignKey: 'nsn_group_id',
            sourceKey:  'nsn_group_id',
            constraints: false,
            as: 'nsn_group'
        }
    );
    
    m.nsns.hasOne(
        m.nsn_classes,
        {
            foreignKey: 'nsn_class_id',
            sourceKey:  'nsn_class_id',
            constraints: false,
            as: 'nsn_class'
        }
    );
    
    m.nsns.hasOne(
        m.nsn_countries,
        {
            foreignKey: 'nsn_country_id',
            sourceKey:  'nsn_country_id',
            constraints: false,
            as: 'nsn_country'
        }
    );
    
    m.nsns.belongsTo(
        m.sizes,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.nsn_groups.hasMany(
        m.nsn_classes,
        {
            foreignKey: 'nsn_group_id',
            targetKey:  'nsn_group_id',
            as: 'nsn_classes'
        }
    );
    
    m.nsn_classes.belongsTo(
        m.nsn_groups,
        {
            foreignKey: 'nsn_group_id',
            targetKey:  'nsn_group_id',
            as: 'nsn_group'
        }
    );
    
    m.nsn_classes.belongsTo(
        m.nsns,
        {
            foreignKey: 'nsn_class_id',
            targetKey:  'nsn_class_id',
            as: 'nsn_class'
        }
    );
    
    m.nsn_groups.belongsTo(
        m.nsns,
        {
            foreignKey: 'nsn_group_id',
            targetKey:  'nsn_group_id',
            as: 'nsn_group'
        }
    );
    
    m.nsn_countries.belongsTo(
        m.nsns,
        {
            foreignKey: 'nsn_country_id',
            targetKey:  'nsn_country_id',
            as: 'nsn_country'
        }
    );
};