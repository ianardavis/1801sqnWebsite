module.exports = function (m) {
    m.paid_in_outs.hasOne(
        m.holdings,
        {
            foreignKey: 'holding_id',
            sourceKey:  'holding_id',
            constraints: false
        }
    );
    
    m.paid_in_outs.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id_paid_in_out',
            constraints: false,
            as: 'user_paid_in_out'
        }
    );
    
    m.paid_in_outs.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};