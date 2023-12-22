module.exports = function (m) {
    m.serials.belongsTo(
        m.sizes,
        {
            foreignKey: 'size_id',
            targetKey:  'size_id'
        }
    );
    
    m.serials.belongsTo(
        m.loancard_lines,
        {
            foreignKey: 'serial_id',
            targetKey:  'serial_id'
        }
    );
    
    m.serials.belongsTo(
        m.scrap_lines,
        {
            foreignKey: 'serial_id',
            targetKey:  'serial_id'
        }
    );
    
    m.serials.hasOne(
        m.locations,
        {
            foreignKey: 'location_id',
            sourceKey:  'location_id',
            constraints: false
        }
    );
    
    m.serials.hasOne(
        m.issues,
        {
            foreignKey: 'issue_id',
            sourceKey:  'issue_id',
            constraints: false
        }
    );
    
    m.serials.hasMany(
        m.receipts,
        {
            foreignKey: 'serial_id',
            targetKey:  'serial_id'
        }
    );
};