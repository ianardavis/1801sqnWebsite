module.exports = function (m) {  
    m.users.users.hasOne( m.users.ranks,         {foreignKey: 'rank_id',          sourceKey: 'rank_id',   constraints: false});
    m.users.users.hasOne( m.users.statuses,      {foreignKey: 'status_id',        sourceKey: 'status_id', constraints: false});
    m.users.users.hasMany(m.users.permissions,   {foreignKey: 'user_id',          targetKey: 'user_id'});
    m.users.users.hasMany(m.stores.permissions,  {foreignKey: 'user_id',          targetKey: 'user_id'});
    m.users.users.hasMany(m.canteen.permissions, {foreignKey: 'user_id',          targetKey: 'user_id'});
    m.users.users.hasMany(m.stores.issues,       {foreignKey: 'user_id_issue',    targetKey: 'user_id'});
    m.users.users.hasMany(m.stores.loancards,    {foreignKey: 'user_id_loancard', targetKey: 'user_id'});
    
    m.stores.adjusts.hasOne(       m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.stores.accounts.hasOne(      m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.stores.issues.hasOne(        m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id_issue', constraints: false, as: 'user_issue'});
    m.stores.issues.hasOne(        m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false, as: 'user'});
    m.stores.notes.hasOne(         m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.stores.orders.hasOne(        m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.stores.actions.hasOne(       m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.stores.demands.hasOne(       m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.stores.demand_lines.hasOne(  m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.stores.loancards.hasOne(     m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    m.stores.loancard_lines.hasOne(m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',       constraints: false});
    
    m.canteen.sessions.hasOne(      m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id_open',    constraints: false, as: 'user_open'});
    m.canteen.sessions.hasOne(      m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id_close',   constraints: false, as: 'user_close'});
    m.canteen.sales.hasOne(         m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false});
    m.canteen.receipts.hasOne(      m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false});
    m.canteen.receipt_lines.hasOne( m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false});
    m.canteen.writeoffs.hasOne(     m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false});
    m.canteen.writeoff_lines.hasOne(m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false});
    m.canteen.credits.hasOne(       m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false});
    m.canteen.payments.hasOne(      m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false});
    m.canteen.movements.hasOne(     m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false, as: 'user'});
    m.canteen.movements.hasOne(     m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id_to',      constraints: false, as: 'user_to'});
    m.canteen.movements.hasOne(     m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id_from',    constraints: false, as: 'user_from'});
    m.canteen.movements.hasOne(     m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id_confirm', constraints: false, as: 'user_confirm'});
    m.canteen.notes.hasOne(         m.users.users, {foreignKey: 'user_id', sourceKey: 'user_id',         constraints: false});
};