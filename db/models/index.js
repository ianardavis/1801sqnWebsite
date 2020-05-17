"use strict";
 
var fs   = require("fs"),
    path = require("path"),
    Seq  = require("sequelize"),
    env  = process.env.NODE_ENV || "development",
    conf = require(path.join(process.env.ROOT, 'config', 'config.json'))[env],
    seq  = new Seq(conf.database, conf.username, conf.password, conf),
    db   = {};
 
fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = seq.import(path.join(__dirname, file));
        db[model.name] = model;
    });
 
db.users.hasOne(db.ranks,        {foreignKey: 'rank_id',       sourceKey: 'rank_id',   constraints: false});
db.users.hasOne(db.statuses,     {foreignKey: 'status_id',     sourceKey: 'status_id', constraints: false});
db.users.hasMany(db.permissions, {foreignKey: 'user_id',       sourceKey: 'user_id'});
db.users.hasMany(db.orders,      {foreignKey: 'ordered_for',   targetKey: 'user_id'});
db.users.hasMany(db.requests,    {foreignKey: 'requested_for', targetKey: 'user_id'});
db.users.hasMany(db.issues,      {foreignKey: 'issued_to',     targetKey: 'user_id'});

db.items.hasOne (db.genders,    {foreignKey: 'gender_id',   sourceKey: 'gender_id',   constraints: false});
db.items.hasOne (db.categories, {foreignKey: 'category_id', sourceKey: 'category_id', constraints: false});
db.items.hasOne (db.groups,     {foreignKey: 'group_id',    sourceKey: 'group_id',    constraints: false});
db.items.hasOne (db.types,      {foreignKey: 'type_id',     sourceKey: 'type_id',     constraints: false});
db.items.hasOne (db.subtypes,   {foreignKey: 'subtype_id',  sourceKey: 'subtype_id',  constraints: false});
db.items.hasMany(db.sizes,      {foreignKey: 'item_id',     targetKey: 'item_id'});

db.sizes.hasOne (db.suppliers,     {foreignKey: 'supplier_id', sourceKey: 'supplier_id', constraints: false});
db.sizes.hasMany(db.nsns,          {foreignKey: 'size_id',     targetKey: 'size_id'});
db.sizes.hasOne(db.nsns,           {foreignKey: 'nsn_id',      targetKey: 'nsn_id'});
db.sizes.belongsTo(db.items,       {foreignKey: 'item_id',     targetKey: 'item_id'});
db.sizes.hasMany(db.request_lines, {foreignKey: 'size_id',     targetKey: 'size_id', as: 'requests'});
db.sizes.hasMany(db.order_lines,   {foreignKey: 'size_id',     targetKey: 'size_id', as: 'orders'});
db.sizes.hasMany(db.demand_lines,  {foreignKey: 'size_id',     targetKey: 'size_id', as: 'demands'});
db.sizes.hasMany(db.stock,         {foreignKey: 'size_id',     targetKey: 'size_id'});
db.sizes.hasMany(db.serials,       {foreignKey: 'size_id',     targetKey: 'size_id'});
db.nsns.belongsTo(db.sizes,        {foreignKey: 'size_id',     targetKey: 'size_id'});
db.stock.belongsTo(db.sizes,       {foreignKey: 'size_id',     targetKey: 'size_id'});

db.stock.hasOne(db.locations,      {foreignKey: 'location_id', sourceKey: 'location_id', constraints: false});
db.locations.hasMany(db.stock,     {foreignKey: 'location_id', targetKey: 'location_id'});
db.stock.hasMany(db.adjusts,       {foreignKey: 'stock_id',    targetKey: 'stock_id'});
db.stock.hasMany(db.issue_lines,   {foreignKey: 'stock_id',    targetKey: 'stock_id', as: 'issues'});
db.stock.hasMany(db.receipt_lines, {foreignKey: 'stock_id',    targetKey: 'stock_id', as: 'receipts'});
db.stock.hasMany(db.return_lines,  {foreignKey: 'stock_id',    targetKey: 'stock_id', as: 'returns'});
db.adjusts.hasOne(db.users,        {foreignKey: 'user_id',     sourceKey: 'user_id',  constraints: false});
db.adjusts.hasOne(db.stock,        {foreignKey: 'stock_id',    sourceKey: 'stock_id', constraints: false});

db.suppliers.hasMany(db.sizes,    {foreignKey: 'supplier_id', targetKey: 'supplier_id'});
db.suppliers.hasMany(db.receipts, {foreignKey: 'supplier_id', targetKey: 'supplier_id'});
db.suppliers.hasMany(db.demands,  {foreignKey: 'supplier_id', targetKey: 'supplier_id'});
db.suppliers.hasOne(db.accounts,  {foreignKey: 'account_id',  sourceKey: 'account_id', constraints: false});
db.suppliers.hasOne(db.files,     {foreignKey: 'file_id',     sourceKey: 'file_id',    constraints: false});

db.accounts.belongsTo(db.suppliers, {foreignKey: 'account_id', targetKey: 'account_id'});
db.accounts.hasOne(db.users,        {foreignKey: 'user_id',    sourceKey: 'user_id', constraints: false});

db.issues.hasOne(db.users,        {foreignKey: 'user_id',  sourceKey: 'issued_to', constraints: false, as: '_to'});
db.issues.hasOne(db.users,        {foreignKey: 'user_id',  sourceKey: 'user_id',   constraints: false, as: '_by'});
db.issues.hasMany(db.issue_lines, {foreignKey: 'issue_id', targetKey: 'issue_id',                      as: 'lines'});

db.issue_lines.hasOne(db.users,        {foreignKey: 'user_id',   sourceKey: 'user_id',        constraints: false});
db.issue_lines.hasOne(db.nsns,         {foreignKey: 'nsn_id',    sourceKey: 'nsn_id',         constraints: false});
db.issue_lines.hasOne(db.stock,        {foreignKey: 'stock_id',  sourceKey: 'stock_id',       constraints: false});
db.issue_lines.hasOne(db.sizes,        {foreignKey: 'size_id',   sourceKey: 'size_id',        constraints: false});
db.issue_lines.hasOne(db.return_lines, {foreignKey: 'line_id',   sourceKey: 'return_line_id', constraints: false, as: 'return'});
db.issue_lines.hasOne(db.serials,      {foreignKey: 'serial_id', sourceKey: 'serial_id',      constraints: false});
db.issue_lines.belongsTo(db.issues,    {foreignKey: 'issue_id',  targetKey: 'issue_id'})

db.returns.hasOne(db.users,         {foreignKey: 'user_id',   sourceKey: 'from',    constraints: false, as: '_from'});
db.returns.hasOne(db.users,         {foreignKey: 'user_id',   sourceKey: 'user_id', constraints: false, as: '_by'});
db.returns.hasMany(db.return_lines, {foreignKey: 'return_id', targetKey: 'return_id',                   as: 'lines'});

db.return_lines.hasOne(db.stock,      {foreignKey: 'stock_id',  sourceKey: 'stock_id', constraints: false});
db.return_lines.hasOne(db.sizes,      {foreignKey: 'size_id',   sourceKey: 'size_id',  constraints: false});
db.return_lines.belongsTo(db.returns, {foreignKey: 'return_id', targetKey: 'return_id'});

db.notes.hasOne(db.users, {foreignKey: 'user_id', sourceKey: 'user_id', constraints: false});

db.orders.hasOne(db.users,        {foreignKey: 'user_id',  sourceKey: 'ordered_for', constraints: false, as: '_for'});
db.orders.hasOne(db.users,        {foreignKey: 'user_id',  sourceKey: 'user_id',     constraints: false, as: '_by'});
db.orders.hasMany(db.order_lines, {foreignKey: 'order_id', targetKey: 'order_id',                        as: 'lines'});

db.order_lines.hasOne(db.users,         {foreignKey: 'user_id',  sourceKey: 'user_id',         constraints: false});
db.order_lines.hasOne(db.sizes,         {foreignKey: 'size_id',  sourceKey: 'size_id',         constraints: false});
db.order_lines.hasOne(db.demand_lines,  {foreignKey: 'line_id',  sourceKey: 'demand_line_id',  constraints: false});
db.order_lines.hasOne(db.receipt_lines, {foreignKey: 'line_id',  sourceKey: 'receipt_line_id', constraints: false});
db.order_lines.hasOne(db.issue_lines,   {foreignKey: 'line_id',  sourceKey: 'issue_line_id',   constraints: false});
db.order_lines.belongsTo(db.orders,     {foreignKey: 'order_id', targetKey: 'order_id'});

db.requests.hasOne(db.users,          {foreignKey: 'user_id',    sourceKey: 'requested_for', constraints: false, as: '_for'});
db.requests.hasOne(db.users,          {foreignKey: 'user_id',    sourceKey: 'user_id',       constraints: false, as: '_by'});
db.requests.hasMany(db.request_lines, {foreignKey: 'request_id', targetKey: 'request_id',                        as: 'lines'});

db.request_lines.hasOne(db.users,       {foreignKey: 'user_id',    sourceKey: 'user_id', constraints: false});
db.request_lines.hasOne(db.sizes,       {foreignKey: 'size_id',    sourceKey: 'size_id', constraints: false});
db.request_lines.belongsTo(db.requests, {foreignKey: 'request_id', targetKey: 'request_id'});

db.receipts.hasOne(db.users,          {foreignKey: 'user_id',     sourceKey: 'user_id',     constraints: false});
db.receipts.hasOne(db.suppliers,      {foreignKey: 'supplier_id', sourceKey: 'supplier_id', constraints: false});
db.receipts.hasMany(db.receipt_lines, {foreignKey: 'receipt_id',  targetKey: 'receipt_id',  as: 'lines'});

db.receipt_lines.hasOne(db.users,       {foreignKey: 'user_id',    sourceKey: 'user_id',  constraints: false});
db.receipt_lines.hasOne(db.stock,       {foreignKey: 'stock_id',   sourceKey: 'stock_id', constraints: false});
db.receipt_lines.hasOne(db.sizes,       {foreignKey: 'size_id',    sourceKey: 'size_id',  constraints: false});
db.receipt_lines.belongsTo(db.receipts, {foreignKey: 'receipt_id', targetKey: 'receipt_id'});

db.demands.belongsTo(db.suppliers,  {foreignKey: 'supplier_id', sourceKey: 'supplier_id'});
db.demands.hasOne(db.users,         {foreignKey: 'user_id',     sourceKey: 'user_id',     constraints: false});
db.demands.hasMany(db.demand_lines, {foreignKey: 'demand_id',   targetKey: 'demand_id',                           as: 'lines'});

db.demand_lines.hasOne(db.users,        {foreignKey: 'user_id',        sourceKey: 'user_id',         constraints: false});
db.demand_lines.hasOne(db.receipt_lines,{foreignKey: 'line_id',        sourceKey: 'receipt_line_id', constraints: false});
db.demand_lines.hasOne(db.sizes,        {foreignKey: 'size_id',        sourceKey: 'size_id',         constraints: false});
db.demand_lines.belongsTo(db.demands,   {foreignKey: 'demand_id',      targetKey: 'demand_id'});
db.demand_lines.hasMany(db.order_lines, {foreignKey: 'demand_line_id', targetKey: 'line_id'});

db.groups.belongsTo(db.categories, {foreignKey: 'category_id', targetKey: 'category_id'});
db.types.belongsTo(db.groups,      {foreignKey: 'group_id',    targetKey: 'group_id'});
db.subtypes.belongsTo(db.types,    {foreignKey: 'type_id',     targetKey: 'type_id'});

db.serials.belongsTo(db.sizes,    {foreignKey: 'size_id', targetKey: 'size_id'});
db.serials.hasOne(db.issue_lines, {foreignKey: 'line_id', sourceKey: 'issue_line_id', as: 'issue', constraints: false});

db.canteen_sessions.hasMany(db.canteen_sales, {foreignKey: 'session_id', targetKey: 'session_id', as: 'sales'});
db.canteen_sessions.hasOne(db.users,          {foreignKey: 'user_id',    sourceKey: 'opened_by',  as: '_opened_by', constraints: false});
db.canteen_sessions.hasOne(db.users,          {foreignKey: 'user_id',    sourceKey: 'closed_by',  as: '_closed_by', constraints: false});

db.canteen_items.hasMany(db.canteen_sale_lines,     {foreignKey: 'item_id', targetKey: 'item_id', as: 'sales'});
db.canteen_items.hasMany(db.canteen_receipt_lines,  {foreignKey: 'item_id', targetKey: 'item_id', as: 'receipts'});
db.canteen_items.hasMany(db.canteen_writeoff_lines, {foreignKey: 'item_id', targetKey: 'item_id', as: 'writeoffs'});

db.canteen_sales.hasMany(db.canteen_sale_lines,  {foreignKey: 'sale_id', targetKey: 'sale_id', as: 'lines'});
db.canteen_sales.hasOne(db.users,                {foreignKey: 'user_id', sourceKey: 'user_id', constraints: false});

db.canteen_sale_lines.hasOne(db.canteen_sales, {foreignKey: 'sale_id', sourceKey: 'sale_id', as: 'sale', constraints: false});
db.canteen_sale_lines.hasOne(db.canteen_items, {foreignKey: 'item_id', sourceKey: 'item_id', as: 'item', constraints: false});

db.canteen_receipts.hasOne(db.users,                  {foreignKey: 'user_id',    sourceKey: 'user_id',    constraints: false});
db.canteen_receipts.hasMany(db.canteen_receipt_lines, {foreignKey: 'receipt_id', targetKey: 'receipt_id', as: 'lines'});

db.canteen_receipt_lines.hasOne(db.canteen_items,       {foreignKey: 'item_id',    sourceKey: 'item_id',    as: 'item', constraints: false});
db.canteen_receipt_lines.belongsTo(db.canteen_receipts, {foreignKey: 'receipt_id', targetKey: 'receipt_id', as: 'receipt'});

db.canteen_writeoffs.hasOne(db.users,                   {foreignKey: 'user_id',     sourceKey: 'user_id',      constraints: false});
db.canteen_writeoffs.hasMany(db.canteen_writeoff_lines, {foreignKey: 'writeoff_id', targetKey: 'writeoff_id', as: 'lines'});

db.canteen_writeoff_lines.hasOne(db.canteen_items,        {foreignKey: 'item_id',     sourceKey: 'item_id',      as: 'item', constraints: false});
db.canteen_writeoff_lines.belongsTo(db.canteen_writeoffs, {foreignKey: 'writeoff_id', targetKey: 'writeoff_id', as: 'writeoff'});

db.sequelize = seq;
db.Sequelize = Seq;
 
module.exports = db;