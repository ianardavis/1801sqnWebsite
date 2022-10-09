module.exports = function (m) {
    m.files.belongsTo(
        m.suppliers,
        {
            foreignKey: 'supplier_id',
            targetKey:  'supplier_id'
        }
    );

    m.files.belongsTo(
        m.suppliers,
        {
            foreignKey: 'supplier_id',
            targetKey:  'supplier_id'
        }
    );

    m.files.hasMany(
        m.file_details,
        {
            foreignKey: 'file_id',
            targetKey:  'file_id',
            as: 'details'
        }
    );

    m.file_details.belongsTo(
        m.files,
        {
            foreignKey: 'file_id',
            targetKey:  'file_id'
        }
    );
    
    m.files.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};