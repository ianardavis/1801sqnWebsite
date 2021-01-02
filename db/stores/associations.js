module.exports = function (m) {  
    m.items.hasOne (m.genders,    {foreignKey: 'gender_id',   sourceKey: 'gender_id',   constraints: false});
    m.items.hasOne (m.categories, {foreignKey: 'category_id', sourceKey: 'category_id', constraints: false});
    m.items.hasOne (m.groups,     {foreignKey: 'group_id',    sourceKey: 'group_id',    constraints: false});
    m.items.hasOne (m.types,      {foreignKey: 'type_id',     sourceKey: 'type_id',     constraints: false});
    m.items.hasOne (m.subtypes,   {foreignKey: 'subtype_id',  sourceKey: 'subtype_id',  constraints: false});
    m.items.hasMany(m.sizes,      {foreignKey: 'item_id',     targetKey: 'item_id'});

    m.sizes.hasOne (  m.suppliers,     {foreignKey: 'supplier_id', sourceKey: 'supplier_id', constraints: false});
    m.sizes.hasMany(  m.nsns,          {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.sizes.hasOne(   m.nsns,          {foreignKey: 'nsn_id',      targetKey: 'nsn_id'});
    m.sizes.belongsTo(m.items,         {foreignKey: 'item_id',     targetKey: 'item_id'});
    m.sizes.hasMany(  m.request_lines, {foreignKey: 'size_id',     targetKey: 'size_id', as: 'requests'});
    m.sizes.hasMany(  m.order_lines,   {foreignKey: 'size_id',     targetKey: 'size_id', as: 'orders'});
    m.sizes.hasMany(  m.demand_lines,  {foreignKey: 'size_id',     targetKey: 'size_id', as: 'demands'});
    m.sizes.hasMany(  m.stock,         {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.sizes.hasMany(  m.serials,       {foreignKey: 'size_id',     targetKey: 'size_id'});

    m.groups.belongsTo(  m.categories, {foreignKey: 'category_id', targetKey: 'category_id'});
    m.types.belongsTo(   m.groups,     {foreignKey: 'group_id',    targetKey: 'group_id'});
    m.subtypes.belongsTo(m.types,      {foreignKey: 'type_id',     targetKey: 'type_id'});

    m.nsns.belongsTo(               m.sizes,               {foreignKey: 'size_id',               targetKey: 'size_id'});
    m.nsn_groups.hasMany(           m.nsn_classifications, {foreignKey: 'nsn_group_id',          targetKey: 'nsn_group_id',          as: 'classifications'});
    m.nsn_classifications.belongsTo(m.nsn_groups,          {foreignKey: 'nsn_group_id',          targetKey: 'nsn_group_id',          as: 'group'});
    m.nsn_classifications.belongsTo(m.nsns,                {foreignKey: 'nsn_classification_id', targetKey: 'nsn_classification_id', as: 'classification'});
    m.nsn_groups.belongsTo(         m.nsns,                {foreignKey: 'nsn_group_id',          targetKey: 'nsn_group_id',          as: 'group'});
    m.nsn_countries.belongsTo(      m.nsns,                {foreignKey: 'nsn_country_id',        targetKey: 'nsn_country_id',        as: 'country'});
    m.nsns.hasOne(                  m.nsn_groups,          {foreignKey: 'nsn_group_id',          sourceKey: 'nsn_group_id',          as: 'group',          constraints: false});
    m.nsns.hasOne(                  m.nsn_classifications, {foreignKey: 'nsn_classification_id', sourceKey: 'nsn_classification_id', as: 'classification', constraints: false});
    m.nsns.hasOne(                  m.nsn_countries,       {foreignKey: 'nsn_country_id',        sourceKey: 'nsn_country_id',        as: 'country',        constraints: false});

    m.stock.belongsTo(  m.sizes,              {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.stock.hasOne(     m.locations,          {foreignKey: 'location_id', sourceKey: 'location_id', constraints: false});
    m.stock.hasMany(    m.adjusts,            {foreignKey: 'stock_id',    targetKey: 'stock_id'});
    m.stock.hasMany(    m.issue_lines,        {foreignKey: 'stock_id',    targetKey: 'stock_id', as: 'issues'});
    m.stock.hasMany(    m.receipt_lines,      {foreignKey: 'stock_id',    targetKey: 'stock_id', as: 'receipts'});
    m.stock.hasMany(    m.issue_line_returns, {foreignKey: 'stock_id',    targetKey: 'stock_id', as: 'returns'});

    m.adjusts.hasOne(   m.stock,              {foreignKey: 'stock_id',    sourceKey: 'stock_id', constraints: false});

    m.locations.hasMany(m.stock,              {foreignKey: 'location_id', targetKey: 'location_id'});
    m.locations.hasMany(m.serials,            {foreignKey: 'location_id', targetKey: 'location_id'});
    m.locations.hasMany(m.issue_line_returns, {foreignKey: 'location_id', targetKey: 'location_id'});
    
    m.suppliers.hasMany(m.sizes,    {foreignKey: 'supplier_id', targetKey: 'supplier_id'});
    m.suppliers.hasMany(m.receipts, {foreignKey: 'supplier_id', targetKey: 'supplier_id'});
    m.suppliers.hasMany(m.demands,  {foreignKey: 'supplier_id', targetKey: 'supplier_id'});
    m.suppliers.hasOne( m.accounts, {foreignKey: 'account_id',  sourceKey: 'account_id', constraints: false});
    m.suppliers.hasOne( m.files,    {foreignKey: 'file_id',     sourceKey: 'file_id',    constraints: false});

    m.accounts.belongsTo(m.suppliers, {foreignKey: 'account_id', targetKey: 'account_id'});

    m.issues.hasMany(           m.issue_lines,        {foreignKey: 'issue_id',      targetKey: 'issue_id',                          as: 'lines'});
    m.issue_lines.hasOne(       m.nsns,               {foreignKey: 'nsn_id',        sourceKey: 'nsn_id',        constraints: false});
    m.issue_lines.hasOne(       m.stock,              {foreignKey: 'stock_id',      sourceKey: 'stock_id',      constraints: false});
    m.issue_lines.hasOne(       m.sizes,              {foreignKey: 'size_id',       sourceKey: 'size_id',       constraints: false});
    m.issue_lines.hasOne(       m.issue_line_returns, {foreignKey: 'issue_line_id', sourceKey: 'line_id',       constraints: false, as: 'return'});
    m.issue_lines.hasOne(       m.serials,            {foreignKey: 'serial_id',     sourceKey: 'serial_id',     constraints: false});
    m.issue_lines.belongsTo(    m.issues,             {foreignKey: 'issue_id',      targetKey: 'issue_id'})
    m.issue_line_returns.hasOne(m.issue_lines,        {foreignKey: 'line_id',       sourceKey: 'issue_line_id', constraints: false});
    m.issue_line_returns.hasOne(m.stock,              {foreignKey: 'stock_id',      sourceKey: 'stock_id',      constraints: false});
    m.issue_line_returns.hasOne(m.locations,          {foreignKey: 'location_id',   sourceKey: 'location_id',   constraints: false});

    m.orders.hasMany(              m.order_lines,        {foreignKey: 'order_id',      targetKey: 'order_id', as: 'lines'});
    m.order_lines.hasOne(          m.sizes,              {foreignKey: 'size_id',       sourceKey: 'size_id',  constraints: false});
    m.order_lines.belongsTo(       m.orders,             {foreignKey: 'order_id',      targetKey: 'order_id'});
    m.order_lines.hasMany(         m.order_line_actions, {foreignKey: 'order_line_id', targetKey: 'line_id',  as: 'actions'});
    m.order_line_actions.belongsTo(m.order_lines,        {foreignKey: 'order_line_id', targetKey: 'line_id'});

    m.requests.hasMany(              m.request_lines,        {foreignKey: 'request_id',      targetKey: 'request_id', as: 'lines'});
    m.request_lines.hasOne(          m.sizes,                {foreignKey: 'size_id',         sourceKey: 'size_id',    constraints: false});
    m.request_lines.belongsTo(       m.requests,             {foreignKey: 'request_id',      targetKey: 'request_id'});
    m.request_lines.hasMany(         m.request_line_actions, {foreignKey: 'request_line_id', targetKey: 'line_id',    as: 'actions'});
    m.request_line_actions.belongsTo(m.request_lines,        {foreignKey: 'request_line_id', targetKey: 'line_id'});

    m.receipts.hasOne(        m.suppliers,            {foreignKey: 'supplier_id',     sourceKey: 'supplier_id', constraints: false});
    m.receipts.hasMany(       m.receipt_lines,        {foreignKey: 'receipt_id',      targetKey: 'receipt_id',  as: 'lines'});
    m.receipt_lines.hasOne(   m.stock,                {foreignKey: 'stock_id',        sourceKey: 'stock_id',    constraints: false});
    m.receipt_lines.hasOne(   m.sizes,                {foreignKey: 'size_id',         sourceKey: 'size_id',     constraints: false});
    m.receipt_lines.hasOne(   m.serials,              {foreignKey: 'serial_id',       sourceKey: 'serial_id',   constraints: false});
    m.receipt_lines.hasOne(   m.locations,            {foreignKey: 'location_id',     sourceKey: 'location_id', constraints: false});
    m.receipt_lines.belongsTo(m.receipts,             {foreignKey: 'receipt_id',      targetKey: 'receipt_id'});
    m.receipt_lines.hasMany(  m.receipt_line_actions, {foreignKey: 'receipt_line_id', targetKey: 'line_id',     as: 'actions'});
    m.receipt_line_actions.belongsTo(m.receipt_lines, {foreignKey: 'receipt_line_id', targetKey: 'line_id'});

    m.demands.belongsTo(            m.suppliers,           {foreignKey: 'supplier_id',    sourceKey: 'supplier_id'});
    m.demands.hasMany(              m.demand_lines,        {foreignKey: 'demand_id',      targetKey: 'demand_id', as: 'lines'});
    m.demand_lines.hasOne(          m.sizes,               {foreignKey: 'size_id',        sourceKey: 'size_id',   constraints: false});
    m.demand_lines.belongsTo(       m.demands,             {foreignKey: 'demand_id',      targetKey: 'demand_id'});
    m.demand_lines.hasMany(         m.demand_line_actions, {foreignKey: 'demand_line_id', targetKey: 'line_id',   as: 'actions'});
    m.demand_line_actions.belongsTo(m.demand_lines,        {foreignKey: 'demand_line_id', targetKey: 'line_id'});

    m.serials.belongsTo(m.sizes,       {foreignKey: 'size_id',     targetKey: 'size_id'});
    m.serials.hasOne(   m.issue_lines, {foreignKey: 'line_id',     sourceKey: 'issue_line_id', as: 'issue', constraints: false});
    m.serials.hasOne(   m.locations,   {foreignKey: 'location_id', sourceKey: 'location_id',                constraints: false});
};