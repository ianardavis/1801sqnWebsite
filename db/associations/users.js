module.exports = function (m) {  
    m.users.hasOne( m.ranks,       {foreignKey: 'rank_id',          sourceKey: 'rank_id',   constraints: false});
    m.users.hasOne( m.statuses,    {foreignKey: 'status_id',        sourceKey: 'status_id', constraints: false});
    m.users.hasMany(m.permissions, {foreignKey: 'user_id',          targetKey: 'user_id'});
    m.users.hasMany(m.issues,      {foreignKey: 'user_id_issue',    targetKey: 'user_id'});
    m.users.hasMany(m.loancards,   {foreignKey: 'user_id_loancard', targetKey: 'user_id'});
    
    m.adjustments   .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    m.accounts      .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    m.issues        .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id_issue',    constraints: false, as: 'user_issue'});
    m.issues        .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false, as: 'user'});
    m.notes         .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    m.orders        .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    m.actions       .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    m.demands       .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    m.demand_lines  .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    m.loancards     .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id_loancard', constraints: false, as: 'user_loancard'});
    m.loancards     .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false, as: 'user'});
    m.loancard_lines.hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    m.files         .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',          constraints: false});
    
    m.sessions .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id_open',  constraints: false, as: 'user_open'});
    m.sessions .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id_close', constraints: false, as: 'user_close'});
    m.sales    .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.receipts .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.writeoffs.hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.credits  .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.payments .hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.movements.hasOne(m.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false, as: 'user'});
};