module.exports = function (m) {
    m.actions.hasMany(       m.action_links, {foreignKey: 'action_id', sourceKey: 'action_id', as: 'links'});
    m.action_links.belongsTo(m.actions,      {foreignKey: 'action_id', sourceKey: 'action_id'});
};