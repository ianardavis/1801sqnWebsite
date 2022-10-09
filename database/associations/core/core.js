module.exports = function (m) {
    m.actions.hasMany(
        m.action_links,
        {
            foreignKey: 'action_id',
            sourceKey:  'action_id',
            as: 'links'
        }
    );
    
    m.actions.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
    
    m.action_links.belongsTo(
        m.actions,
        {
            foreignKey: 'action_id',
            sourceKey:  'action_id'
        }
    );
    
    m.genders.belongsToMany(
        m.items,
        {
            foreignKey:'gender_id',
            through:  m.item_genders
        }
    );
    
    m.notes.hasOne(
        m.users,
        {
            foreignKey: 'user_id',
            sourceKey:  'user_id',
            constraints: false
        }
    );
};