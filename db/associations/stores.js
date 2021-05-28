module.exports = function (m) {
    m.accounts.belongsTo(       m.suppliers,       {foreignKey: 'account_id',         targetKey: 'account_id'});
    m.adjustments.hasOne(       m.stocks,          {foreignKey: 'stock_id',           sourceKey: 'stock_id',       constraints: false});
    m.adjustments.hasOne(       m.sizes,           {foreignKey: 'size_id',            sourceKey: 'size_id',        constraints: false});
    m.categories.hasMany(       m.categories,      {foreignKey: 'category_id_parent', sourceKey: 'category_id',                        as: 'children'});
    m.categories.belongsTo(     m.categories,      {foreignKey: 'category_id_parent', targetKey: 'category_id',                        as: 'parent'});
    m.demand_lines.hasOne(      m.sizes,           {foreignKey: 'size_id',            sourceKey: 'size_id',        constraints: false});
    m.demand_lines.belongsTo(   m.demands,         {foreignKey: 'demand_id',          targetKey: 'demand_id'});
    m.demands.belongsTo(        m.suppliers,       {foreignKey: 'supplier_id',        sourceKey: 'supplier_id'});
    m.demands.hasMany(          m.demand_lines,    {foreignKey: 'demand_id',          targetKey: 'demand_id',                          as: 'lines'});
    m.embodiments.hasOne(       m.sizes,           {foreignKey: 'size_id',            sourceKey: 'size_id_parent', constraints: false, as: 'parent'});
    m.embodiments.hasOne(       m.sizes,           {foreignKey: 'size_id',            sourceKey: 'size_id_child',  constraints: false, as: 'child'});
    m.files.belongsTo(          m.suppliers,       {foreignKey: 'supplier_id',        targetKey: 'supplier_id'});
    m.files.hasMany(            m.file_details,    {foreignKey: 'file_id',            targetKey: 'file_id',                            as: 'details'})
    m.file_details.belongsTo(   m.files,           {foreignKey: 'file_id',            targetKey: 'file_id'});
    m.issues.hasOne(            m.sizes,           {foreignKey: 'size_id',            sourceKey:  'size_id',       constraints: false});
    m.items.hasOne (            m.genders,         {foreignKey: 'gender_id',          sourceKey: 'gender_id',      constraints: false});
    m.sizes.hasMany(            m.details,         {foreignKey: 'size_id',            sourceKey: 'size_id'});
    m.items.hasMany(            m.sizes,           {foreignKey: 'item_id',            targetKey: 'item_id'});
    m.items.hasMany(            m.item_categories, {foreignKey: 'item_id',           targetKey: 'item_id'});
    m.item_categories.hasOne(   m.categories,      {foreignKey: 'category_id',        sourceKey: 'category_id',    constraints: false});
    m.item_categories.belongsTo(m.items,           {foreignKey: 'item_id',            targetKey: 'item_id'});
    m.loancard_lines.hasOne(    m.sizes,           {foreignKey: 'size_id',            sourceKey: 'size_id',        constraints: false});
    m.loancard_lines.hasOne(    m.serials,         {foreignKey: 'serial_id',          sourceKey: 'serial_id',      constraints: false});
    m.loancard_lines.hasOne(    m.nsns,            {foreignKey: 'nsn_id',             sourceKey: 'nsn_id',         constraints: false});
    m.loancard_lines.belongsTo( m.loancards,       {foreignKey: 'loancard_id',        targetKey: 'loancard_id'});
    m.loancards.hasMany(        m.loancard_lines,  {foreignKey: 'loancard_id',        sourceKey: 'loancard_id',                        as: 'lines'});
    m.locations.hasMany(        m.stocks,          {foreignKey: 'location_id',        targetKey: 'location_id'});
    m.locations.hasMany(        m.serials,         {foreignKey: 'location_id',        targetKey: 'location_id'});
    m.nsns.belongsTo(           m.sizes,           {foreignKey: 'size_id',            targetKey: 'size_id'});
    m.nsn_groups.hasMany(       m.nsn_classes,     {foreignKey: 'nsn_group_id',       targetKey: 'nsn_group_id',                       as: 'nsn_classes'});
    m.nsn_classes.belongsTo(    m.nsn_groups,      {foreignKey: 'nsn_group_id',       targetKey: 'nsn_group_id',                       as: 'nsn_group'});
    m.nsn_classes.belongsTo(    m.nsns,            {foreignKey: 'nsn_class_id',       targetKey: 'nsn_class_id',                       as: 'nsn_class'});
    m.nsn_groups.belongsTo(     m.nsns,            {foreignKey: 'nsn_group_id',       targetKey: 'nsn_group_id',                       as: 'nsn_group'});
    m.nsn_countries.belongsTo(  m.nsns,            {foreignKey: 'nsn_country_id',     targetKey: 'nsn_country_id',                     as: 'nsn_country'});
    m.nsns.hasOne(              m.nsn_groups,      {foreignKey: 'nsn_group_id',       sourceKey: 'nsn_group_id',   constraints: false, as: 'nsn_group'});
    m.nsns.hasOne(              m.nsn_classes,     {foreignKey: 'nsn_class_id',       sourceKey: 'nsn_class_id',   constraints: false, as: 'nsn_class'});
    m.nsns.hasOne(              m.nsn_countries,   {foreignKey: 'nsn_country_id',     sourceKey: 'nsn_country_id', constraints: false, as: 'nsn_country'});
    m.orders.hasOne(            m.sizes,           {foreignKey: 'size_id',            sourceKey: 'size_id',        constraints: false});
    m.serials.belongsTo(        m.sizes,           {foreignKey: 'size_id',            targetKey: 'size_id'});
    m.serials.hasOne(           m.locations,       {foreignKey: 'location_id',        sourceKey: 'location_id',    constraints: false});
    m.serials.hasOne(           m.issues,          {foreignKey: 'issue_id',           sourceKey: 'issue_id',       constraints: false});
    m.sizes.hasOne (            m.suppliers,       {foreignKey: 'supplier_id',        sourceKey: 'supplier_id',    constraints: false});
    m.sizes.hasMany(            m.nsns,            {foreignKey: 'size_id',            targetKey: 'size_id'});
    m.sizes.hasOne(             m.nsns,            {foreignKey: 'nsn_id',             targetKey: 'nsn_id',         constraints: false});
    m.sizes.belongsTo(          m.items,           {foreignKey: 'item_id',            targetKey: 'item_id'});
    m.sizes.hasMany(            m.issues,          {foreignKey: 'size_id',            targetKey: 'size_id'});
    m.sizes.hasMany(            m.orders,          {foreignKey: 'size_id',            targetKey: 'size_id'});
    m.sizes.hasMany(            m.demand_lines,    {foreignKey: 'size_id',            targetKey: 'size_id',                            as: 'demands'});
    m.sizes.hasMany(            m.stocks,          {foreignKey: 'size_id',            targetKey: 'size_id'});
    m.sizes.hasMany(            m.serials,         {foreignKey: 'size_id',            targetKey: 'size_id'});
    m.stocks.belongsTo(         m.sizes,           {foreignKey: 'size_id',            targetKey: 'size_id'});
    m.stocks.hasOne(            m.locations,       {foreignKey: 'location_id',        sourceKey: 'location_id',    constraints: false});
    m.stocks.hasMany(           m.adjustments,     {foreignKey: 'stock_id',           targetKey: 'stock_id'});
    m.suppliers.hasMany(        m.sizes,           {foreignKey: 'supplier_id',        targetKey: 'supplier_id'});
    m.suppliers.hasMany(        m.demands,         {foreignKey: 'supplier_id',        targetKey: 'supplier_id'});
    m.suppliers.hasOne(         m.accounts,        {foreignKey: 'account_id',         sourceKey: 'account_id',     constraints: false});
    m.suppliers.hasMany(        m.files,           {foreignKey: 'supplier_id',        targetKey: 'supplier_id'});
    m.files.belongsTo(          m.suppliers,       {foreignKey: 'supplier_id',        targetKey: 'supplier_id'});
    m.supplier_addresses.hasOne(m.addresses,       {foreignKey: 'address_id',         sourceKey: 'address_id',     constraints: false});
    m.supplier_contacts.hasOne( m.contacts,        {foreignKey: 'contact_id',         sourceKey: 'contact_id',     constraints: false});
};