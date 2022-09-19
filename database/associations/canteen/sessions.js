module.exports = function (m) {
    m.sessions.hasMany(
        m.sales,
        {
            foreignKey: 'session_id',
            targetKey:  'session_id'
        }
    );
    
    m.sessions.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id_open', 
            constraints: false,
            as: 'user_open'
        }
    );
    
    m.sessions.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id_close', 
            constraints: false,
            as: 'user_close'
        }
    );
};