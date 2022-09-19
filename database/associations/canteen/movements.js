module.exports = function (m) {
    m.movements.hasOne(
        m.holdings,
        {
            foreignKey: 'holding_id',
            sourceKey:  'holding_id_from',
            as: 'holding_from',
            constraints: false
        }
    );
    
    m.movements.hasOne(
        m.holdings,
        {
            foreignKey: 'holding_id',
            sourceKey:  'holding_id_to',
            as: 'holding_to',
            constraints: false
        }
    );
    
    m.movements.hasOne(
        m.sessions,
        {
            foreignKey: 'session_id',
            sourceKey:  'session_id',
            constraints: false
        }
    );
    
    m.movements.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};