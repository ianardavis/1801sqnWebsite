module.exports = function (m) {
    m.accounts.belongsTo(
        m.suppliers, 
        {
            foreignKey: 'account_id',
            targetKey:  'account_id'
        }
    );
    
    m.accounts.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};