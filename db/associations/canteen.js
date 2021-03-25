module.exports = function (m) {
    m.sessions.hasMany(     m.sales,        {foreignKey: 'session_id', targetKey: 'session_id'});
    m.canteen_items.hasMany(m.sale_lines,   {foreignKey: 'item_id',    targetKey: 'item_id',         as: 'sales'});
    m.canteen_items.hasMany(m.receipts,     {foreignKey: 'item_id',    targetKey: 'item_id'});
    m.canteen_items.hasMany(m.writeoffs,    {foreignKey: 'item_id',    targetKey: 'item_id'});
    m.sales.hasMany(        m.sale_lines,   {foreignKey: 'sale_id',    targetKey: 'sale_id',         as: 'lines'});
    m.sales.hasMany(        m.payments,     {foreignKey: 'sale_id',    targetKey: 'sale_id'});
    m.sales.hasOne(         m.sessions,     {foreignKey: 'session_id', sourceKey: 'session_id'});
    m.sale_lines.hasOne(    m.sales,        {foreignKey: 'sale_id',    sourceKey: 'sale_id',                             constraints: false});
    m.sale_lines.hasOne(    m.canteen_items,{foreignKey: 'item_id',    sourceKey: 'item_id',                             constraints: false});
    m.payments.hasOne(      m.sales,        {foreignKey: 'sale_id',    sourceKey: 'sale_id',                             constraints: false});
    m.receipts.belongsTo(   m.canteen_items,{foreignKey: 'item_id',    targetKey: 'item_id'});
    m.writeoffs.belongsTo(  m.canteen_items,{foreignKey: 'item_id',    sourceKey: 'item_id'});
    m.pos_pages.hasMany(    m.pos_layouts,  {foreignKey: 'page_id',    targetKey: 'page_id',         as: 'items'});
    m.pos_layouts.hasOne(   m.canteen_items,{foreignKey: 'item_id',    sourceKey: 'item_id',                             constraints: false});
    m.movements.hasOne(     m.holdings,     {foreignKey: 'holding_id', sourceKey: 'holding_id_to',   as: 'holding_to',   constraints: false});
    m.movements.hasOne(     m.holdings,     {foreignKey: 'holding_id', sourceKey: 'holding_id_from', as: 'holding_from', constraints: false});
};