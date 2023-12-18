module.exports = function (m) {  
    m.users.hasOne(
        m.ranks,
        {
            foreignKey: 'rank_id',
            sourceKey:  'rank_id',
            constraints: false
        }
    );
    
    m.users.hasOne(
        m.statuses,
        {
            foreignKey: 'status_id',
            sourceKey:  'status_id',
            constraints: false
        }
    );
    
    m.users.hasMany(
        m.permissions,
        {
            foreignKey: 'user_id',
            targetKey:  'user_id'
        }
    );
    
    m.users.hasMany(
        m.issues,
        {
            foreignKey: 'user_id_issue',
            targetKey:  'user_id'
        }
    );
    
    m.users.hasMany(
        m.loancards,
        {
            foreignKey: 'user_id_loancard',
            targetKey:  'user_id'
        }
    );
    
    m.users.hasMany(
        m.giftaid,
        {
            foreignKey: 'user_id',
            targetKey:  'user_id'
        }
    );
    
    m.users.hasMany(
        m.demand_line_receipts,
        {
            foreignKey: 'user_id',
            targetKey:  'user_id'
        }
    );

    m.users.belongsToMany(
        m.sites, 
        {
            through: m.user_sites,
            foreignKey:'user_id'
        }
    );
};