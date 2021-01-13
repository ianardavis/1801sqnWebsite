module.exports = function (m) {
    m.accounts.belongsTo(           m.suppliers,           {foreignKey: 'account_id', targetKey: 'account_id'});

    m.adjusts.hasOne(               m.stocks,              {foreignKey: 'stock_id', sourceKey: 'stock_id', constraints: false});
    
    m.categories.hasMany(           m.groups,              {foreignKey: 'category_id', targetKey: 'category_id'});
    
    m.demand_lines.hasOne(          m.sizes,               {foreignKey: 'size_id',   sourceKey: 'size_id', constraints: false});
    m.demand_lines.belongsTo(       m.demands,             {foreignKey: 'demand_id', targetKey: 'demand_id'});
    
    m.demands.belongsTo(            m.suppliers,           {foreignKey: 'supplier_id', sourceKey: 'supplier_id'});
    m.demands.hasMany(              m.demand_lines,        {foreignKey: 'demand_id',   targetKey: 'demand_id', as: 'lines'});
    
    m.embodiments.hasOne(           m.sizes,               {foreignKey: 'size_id', sourceKey: 'size_id_parent', as: 'parent', constraints: false});
    m.embodiments.hasOne(           m.sizes,               {foreignKey: 'size_id', sourceKey: 'size_id_child',  as: 'child',  constraints: false});

    m.files.belongsTo(              m.suppliers,           {foreignKey: 'file_id', targetKey: 'file_id'});

    m.groups.belongsTo(             m.categories,          {foreignKey: 'category_id', targetKey: 'category_id'});
    m.groups.hasMany(               m.types,               {foreignKey: 'group_id',    targetKey: 'group_id'});
    
    m.issue_actions.belongsTo(      m.issues,              {foreignKey: 'issue_id',  targetKey: 'issue_id'});
    m.issue_actions.hasOne(         m.stocks,              {foreignKey: 'stock_id',  sourceKey: 'stock_id',         constraints: false});
    m.issue_actions.hasOne(         m.nsns,                {foreignKey: 'nsn_id',    sourceKey: 'nsn_id',           constraints: false});
    m.issue_actions.hasOne(         m.serials,             {foreignKey: 'serial_id', sourceKey: 'serial_id',        constraints: false});
    m.issue_actions.hasOne(         m.orders,              {foreignKey: 'order_id',  sourceKey: 'order_id',         constraints: false});
    m.issue_actions.hasOne(         m.loancard_lines,      {foreignKey: 'line_id',   sourceKey: 'loancard_line_id', constraints: false});

    m.issues.hasOne(                m.sizes,               {foreignKey: 'size_id',  sourceKey:  'size_id',  constraints: false});
    m.issues.hasOne(                m.loancard_lines,      {foreignKey: 'issue_id', foreignKey: 'issue_id', constraints: false});
    m.issues.hasMany(               m.issue_actions,       {foreignKey: 'issue_id', targetKey:  'issue_id', as: 'actions'});

    m.items.hasOne (                m.genders,             {foreignKey: 'gender_id',   sourceKey: 'gender_id',   constraints: false});
    m.items.hasOne (                m.categories,          {foreignKey: 'category_id', sourceKey: 'category_id', constraints: false});
    m.items.hasOne (                m.groups,              {foreignKey: 'group_id',    sourceKey: 'group_id',    constraints: false});
    m.items.hasOne (                m.types,               {foreignKey: 'type_id',     sourceKey: 'type_id',     constraints: false});
    m.items.hasOne (                m.subtypes,            {foreignKey: 'subtype_id',  sourceKey: 'subtype_id',  constraints: false});
    m.items.hasMany(                m.sizes,               {foreignKey: 'item_id',     targetKey: 'item_id'});

    m.loancard_lines.hasOne(        m.sizes,               {foreignKey: 'size_id',     sourceKey: 'size_id',   constraints: false});
    m.loancard_lines.hasOne(        m.serials,             {foreignKey: 'serial_id',   sourceKey: 'serial_id', constraints: false});
    m.loancard_lines.hasOne(        m.nsns,                {foreignKey: 'nsn_id',      sourceKey: 'nsn_id',    constraints: false});
    m.loancard_lines.belongsTo(     m.loancards,           {foreignKey: 'loancard_id', targetKey: 'loancard_id'});
    m.loancard_lines.belongsTo(     m.issues,              {foreignKey: 'issue_id',    targetKey: 'issue_id'});

    m.locations.hasMany(            m.stocks,              {foreignKey: 'location_id', targetKey: 'location_id'});
    m.locations.hasMany(            m.serials,             {foreignKey: 'location_id', targetKey: 'location_id'});
 
    m.nsns.belongsTo(               m.sizes,               {foreignKey: 'size_id',               targetKey: 'size_id'});
    m.nsn_groups.hasMany(           m.nsn_classifications, {foreignKey: 'nsn_group_id',          targetKey: 'nsn_group_id',          as: 'classifications'});
    m.nsn_classifications.belongsTo(m.nsn_groups,          {foreignKey: 'nsn_group_id',          targetKey: 'nsn_group_id',          as: 'group'});
    m.nsn_classifications.belongsTo(m.nsns,                {foreignKey: 'nsn_classification_id', targetKey: 'nsn_classification_id', as: 'classification'});
    m.nsn_groups.belongsTo(         m.nsns,                {foreignKey: 'nsn_group_id',          targetKey: 'nsn_group_id',          as: 'group'});
    m.nsn_countries.belongsTo(      m.nsns,                {foreignKey: 'nsn_country_id',        targetKey: 'nsn_country_id',        as: 'country'});
    m.nsns.hasOne(                  m.nsn_groups,          {foreignKey: 'nsn_group_id',          sourceKey: 'nsn_group_id',          as: 'group',          constraints: false});
    m.nsns.hasOne(                  m.nsn_classifications, {foreignKey: 'nsn_classification_id', sourceKey: 'nsn_classification_id', as: 'classification', constraints: false});
    m.nsns.hasOne(                  m.nsn_countries,       {foreignKey: 'nsn_country_id',        sourceKey: 'nsn_country_id',        as: 'country',        constraints: false});
    
    m.order_actions.belongsTo(      m.orders,              {foreignKey: 'order_id',  targetKey: 'order_id'});
    m.order_actions.hasOne(         m.stocks,              {foreignKey: 'stock_id',  sourceKey: 'stock_id',        constraints: false});
    m.order_actions.hasOne(         m.nsns,                {foreignKey: 'nsn_id',    sourceKey: 'nsn_id',          constraints: false});
    m.order_actions.hasOne(         m.serials,             {foreignKey: 'serial_id', sourceKey: 'serial_id',       constraints: false});
    m.order_actions.hasOne(         m.demand_lines,        {foreignKey: 'line_id',   sourceKey: 'demand_line_id',  constraints: false});

    m.orders.hasOne(                m.sizes,               {foreignKey: 'size_id',  sourceKey: 'size_id',  constraints: false});
    m.orders.hasMany(               m.order_actions,       {foreignKey: 'order_id', targetKey: 'order_id', as: 'actions'});
    
    m.serials.belongsTo(            m.sizes,               {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.serials.hasOne(               m.locations,           {foreignKey: 'location_id', sourceKey: 'location_id', constraints: false});

    m.sizes.hasOne (                m.suppliers,           {foreignKey: 'supplier_id', sourceKey: 'supplier_id', constraints: false});
    m.sizes.hasMany(                m.nsns,                {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.sizes.hasOne(                 m.nsns,                {foreignKey: 'nsn_id',      targetKey: 'nsn_id'});
    m.sizes.belongsTo(              m.items,               {foreignKey: 'item_id',     targetKey: 'item_id'});
    m.sizes.hasMany(                m.issues,              {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.sizes.hasMany(                m.orders,              {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.sizes.hasMany(                m.demand_lines,        {foreignKey: 'size_id',     targetKey: 'size_id', as: 'demands'});
    m.sizes.hasMany(                m.stocks,              {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.sizes.hasMany(                m.serials,             {foreignKey: 'size_id',     targetKey: 'size_id'});

    m.types.belongsTo(              m.groups,              {foreignKey: 'group_id',    targetKey: 'group_id'});
    m.subtypes.belongsTo(           m.types,               {foreignKey: 'type_id',     targetKey: 'type_id'});

    m.stocks.belongsTo(             m.sizes,               {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.stocks.hasOne(                m.locations,           {foreignKey: 'location_id', sourceKey: 'location_id', constraints: false});
    m.stocks.hasMany(               m.adjusts,             {foreignKey: 'stock_id',    targetKey: 'stock_id'});
    m.stocks.hasMany(               m.issue_actions,       {foreignKey: 'stock_id',    targetKey: 'stock_id', as: 'issues'});
    m.stocks.hasMany(               m.order_actions,       {foreignKey: 'stock_id',    targetKey: 'stock_id', as: 'orders'});
   
    m.suppliers.hasMany(            m.sizes,               {foreignKey: 'supplier_id', targetKey: 'supplier_id'});
    m.suppliers.hasMany(            m.demands,             {foreignKey: 'supplier_id', targetKey: 'supplier_id'});
    m.suppliers.hasOne(             m.accounts,            {foreignKey: 'account_id',  sourceKey: 'account_id', constraints: false});
    m.suppliers.hasOne(             m.files,               {foreignKey: 'file_id',     sourceKey: 'file_id',    constraints: false});
};