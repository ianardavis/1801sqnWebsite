module.exports = function (m) {
    m.suppliers.hasMany(
        m.sizes,
        {
            foreignKey: 'supplier_id',
            targetKey: 'supplier_id'
        }
    );
    
    m.suppliers.hasMany(
        m.demands,
        {
            foreignKey: 'supplier_id',
            targetKey: 'supplier_id'
        }
    );
    
    m.suppliers.hasOne(
        m.accounts,
        {
            foreignKey: 'account_id',
            sourceKey: 'account_id',
            constraints: false
        }
    );
    
    m.suppliers.hasMany(
        m.files,
        {
            foreignKey: 'supplier_id',
            targetKey: 'supplier_id'
        }
    );
    
    m.suppliers.belongsToMany(
        m.addresses,
        {
            through: m.supplier_addresses,
            foreignKey:'supplier_id'
        }
    );
    
    m.suppliers.belongsToMany(
        m.contacts,
        {
            through: m.supplier_contacts,
            foreignKey:'supplier_id'
        }
    );
    
    m.addresses.belongsToMany(
        m.suppliers,
        {
            through: m.supplier_addresses,
            foreignKey:'address_id'
        }
    );
    
    m.contacts.belongsToMany(
        m.suppliers,
        {
            through: m.supplier_contacts,
            foreignKey:'contact_id'
        }
    );
};