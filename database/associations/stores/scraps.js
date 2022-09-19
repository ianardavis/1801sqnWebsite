module.exports = function (m) {
    m.scraps.belongsTo(
        m.suppliers, 
        {
            foreignKey: 'supplier_id',
            targetKey:  'supplier_id'
        }
    );

    m.scraps.hasMany(
        m.scrap_lines, 
        {
            foreignKey: 'scrap_id',
            targetKey:  'scrap_id',
            as: 'lines'
        }
    );

    m.scrap_lines.hasOne(
        m.sizes, 
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id',
            constraints: false
        }
    );

    m.scrap_lines.belongsTo(
        m.scraps, 
        {
            foreignKey: 'scrap_id',
            targetKey:  'scrap_id'
        }
    );

    m.scrap_lines.hasOne(
        m.serials, 
        {
            foreignKey: 'serial_id',
            sourceKey:  'serial_id',
            constraints: false
        }
    );

    m.scrap_lines.hasOne(
        m.nsns, 
        {
            foreignKey: 'nsn_id',
            sourceKey:  'nsn_id',
            constraints: false
        }
    );
};