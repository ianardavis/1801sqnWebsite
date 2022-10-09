module.exports = function (m) {
    m.locations.hasMany(
        m.stocks, 
        {
            foreignKey: 'location_id',
            targetKey:  'location_id'
        }
    );
    
    m.locations.hasMany(
        m.serials, 
        {
            foreignKey: 'location_id',
            targetKey:  'location_id'
        }
    );
};