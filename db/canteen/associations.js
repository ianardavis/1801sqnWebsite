module.exports = function (m) {  
    m.sessions.hasMany(        m.sales,          {foreignKey: 'session_id',  targetKey: 'session_id',  as: 'sales'});
    m.items.hasMany(           m.sale_lines,     {foreignKey: 'item_id',     targetKey: 'item_id',     as: 'sales'});
    m.items.hasMany(           m.receipt_lines,  {foreignKey: 'item_id',     targetKey: 'item_id',     as: 'receipts'});
    m.items.hasMany(           m.writeoff_lines, {foreignKey: 'item_id',     targetKey: 'item_id',     as: 'writeoffs'});
    m.sales.hasMany(           m.sale_lines,     {foreignKey: 'sale_id',     targetKey: 'sale_id',     as: 'lines'});
    m.sale_lines.hasOne(       m.sales,          {foreignKey: 'sale_id',     sourceKey: 'sale_id',     as: 'sale', constraints: false});
    m.sale_lines.hasOne(       m.items,          {foreignKey: 'item_id',     sourceKey: 'item_id',     as: 'item', constraints: false});
    m.receipts.hasMany(        m.receipt_lines,  {foreignKey: 'receipt_id',  targetKey: 'receipt_id',  as: 'lines'});
    m.receipt_lines.hasOne(    m.items,          {foreignKey: 'item_id',     sourceKey: 'item_id',     as: 'item', constraints: false});
    m.receipt_lines.belongsTo( m.receipts,       {foreignKey: 'receipt_id',  targetKey: 'receipt_id',  as: 'receipt'});
    m.writeoffs.hasMany(       m.writeoff_lines, {foreignKey: 'writeoff_id', targetKey: 'writeoff_id', as: 'lines'});
    m.writeoff_lines.hasOne(   m.items,          {foreignKey: 'item_id',     sourceKey: 'item_id',     as: 'item', constraints: false});
    m.writeoff_lines.belongsTo(m.writeoffs,      {foreignKey: 'writeoff_id', targetKey: 'writeoff_id', as: 'writeoff'});
};