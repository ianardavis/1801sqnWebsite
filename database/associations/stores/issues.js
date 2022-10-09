module.exports = function (m) {
    m.issues.belongsToMany(
        m.loancard_lines,
        {
            foreignKey:'issue_id',
            through: m.issue_loancard_lines
        }
    );
    
    m.issues.hasOne(
        m.sizes,
        {
            foreignKey: 'size_id',
            sourceKey:  'size_id',
            constraints: false
        }
    );
    
    m.issues.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id_issue',
            constraints: false,
            as: 'user_issue'
        }
    );
    
    m.issues.belongsTo(
        m.orders,
        {
            foreignKey: 'order_id',
            targetKey:  'order_id'
        }
    );

    m.issues.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};