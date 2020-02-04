"use strict";
 
var fs   = require("fs"),
    path = require("path"),
    Seq  = require("sequelize"),
    env  = process.env.NODE_ENV || "development",
    conf = require(path.join(__dirname, '..', '..', 'config', 'config.json'))[env],
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
 
db.users.hasOne(db.ranks,            {foreignKey: 'rank_id',       sourceKey: 'rank_id',         constraints: false});
db.users.hasOne(db.statuses,         {foreignKey: 'status_id',     sourceKey: 'status_id',       constraints: false});
db.users.hasOne(db.permissions,      {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false});
db.users.hasMany(db.orders,          {foreignKey: 'ordered_for',   targetKey: 'user_id'});
db.users.hasMany(db.requests,        {foreignKey: 'requested_for', targetKey: 'user_id'});
db.users.hasMany(db.issues,          {foreignKey: 'issued_to',     targetKey: 'user_id'});

db.items.hasOne (db.genders,         {foreignKey: 'gender_id',     sourceKey: 'gender_id',       constraints: false});
db.items.hasOne (db.categories,      {foreignKey: 'category_id',   sourceKey: 'category_id',     constraints: false});
db.items.hasOne (db.groups,          {foreignKey: 'group_id',      sourceKey: 'group_id',        constraints: false});
db.items.hasOne (db.types,           {foreignKey: 'type_id',       sourceKey: 'type_id',         constraints: false});
db.items.hasOne (db.subtypes,        {foreignKey: 'subtype_id',    sourceKey: 'subtype_id',      constraints: false});
db.items.hasMany(db.item_sizes,      {foreignKey: 'item_id',       targetKey: 'item_id'});

db.item_sizes.hasOne (db.suppliers,  {foreignKey: 'supplier_id',   sourceKey: 'supplier_id',     constraints: false});
db.item_sizes.hasMany(db.nsns,       {foreignKey: 'itemsize_id',   targetKey: 'itemsize_id'});
db.item_sizes.belongsTo(db.items,    {foreignKey: 'item_id',       targetKey: 'item_id'});
db.item_sizes.hasMany(db.requests_l, {foreignKey: 'itemsize_id',   sourceKey: 'itemsize_id'});
db.item_sizes.hasMany(db.orders_l,   {foreignKey: 'itemsize_id',   sourceKey: 'itemsize_id'});
db.item_sizes.hasMany(db.demands_l,  {foreignKey: 'itemsize_id',   sourceKey: 'itemsize_id'});
db.item_sizes.hasMany(db.issues_l,   {foreignKey: 'itemsize_id',   sourceKey: 'itemsize_id'});
db.item_sizes.hasMany(db.stock,      {foreignKey: 'itemsize_id',   targetKey: 'itemsize_id'});
db.item_sizes.hasMany(db.serials,    {foreignKey: 'itemsize_id',   targetKey: 'itemsize_id'});
db.nsns.belongsTo(db.item_sizes,     {foreignKey: 'itemsize_id',   targetKey: 'itemsize_id'});
db.stock.belongsTo(db.item_sizes,    {foreignKey: 'itemsize_id',   targetKey: 'itemsize_id'});

db.stock.hasOne(db.locations,        {foreignKey: 'location_id',   sourceKey: 'location_id',     constraints: false});
db.locations.hasMany(db.stock,       {foreignKey: 'location_id',   sourceKey: 'location_id'});
db.stock.hasMany(db.adjusts,         {foreignKey: 'stock_id',      sourceKey: 'stock_id'});
db.stock.hasMany(db.issues_l,        {foreignKey: 'stock_id',      sourceKey: 'stock_id'});
db.stock.hasMany(db.receipts_l,      {foreignKey: 'stock_id',      sourceKey: 'stock_id'});
db.stock.hasMany(db.returns_l,       {foreignKey: 'stock_id',      sourceKey: 'stock_id'});
db.adjusts.hasOne(db.users,          {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false});

db.suppliers.hasMany(db.item_sizes,  {foreignKey: 'supplier_id',   sourceKey: 'supplier_id'});
db.suppliers.hasOne(db.inventories,  {foreignKey: 'inventory_id',  sourceKey: 'inventory_id',    constraints: false});
db.suppliers.hasOne(db.files,        {foreignKey: 'file_id',       sourceKey: 'file_id',         constraints: false});

db.issues.hasOne(db.users,           {foreignKey: 'user_id',       sourceKey: 'issued_to',       constraints: false, as: '_to'});
db.issues.hasOne(db.users,           {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false, as: '_by'});
db.issues.hasMany(db.issues_l,       {foreignKey: 'issue_id',      targetKey: 'issue_id',                            as: 'lines'});

db.issues_l.hasOne(db.item_sizes,    {foreignKey: 'itemsize_id',   sourceKey: 'itemsize_id',     constraints: false});
db.issues_l.hasOne(db.nsns,          {foreignKey: 'nsn_id',        sourceKey: 'nsn_id',          constraints: false});
db.issues_l.hasOne(db.stock,         {foreignKey: 'stock_id',      sourceKey: 'stock_id',        constraints: false});
db.issues_l.hasOne(db.returns_l,     {foreignKey: 'line_id',       sourceKey: 'return_line_id',  constraints: false});
db.issues_l.hasOne(db.serials,       {foreignKey: 'serial_id',     sourceKey: 'serial_id',       constraints: false});
db.issues_l.belongsTo(db.issues,     {foreignKey: 'issue_id',      targetKey: 'issue_id'})

db.returns.hasOne(db.users,          {foreignKey: 'user_id',       sourceKey: 'from',            constraints: false, as: '_from'});
db.returns.hasOne(db.users,          {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false, as: '_by'});
db.returns.hasMany(db.returns_l,     {foreignKey: 'return_id',     targetKey: 'return_id',                           as: 'lines'});

db.returns_l.hasOne(db.stock,        {foreignKey: 'stock_id',      sourceKey: 'stock_id',        constraints: false});
db.returns_l.belongsTo(db.returns,   {foreignKey: 'return_id',     targetKey: 'return_id'});

db.notes.hasOne(db.users,            {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false});

db.orders.hasOne(db.users,           {foreignKey: 'user_id',       sourceKey: 'ordered_for',     constraints: false, as: '_for'});
db.orders.hasOne(db.users,           {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false, as: '_by'});
db.orders.hasMany(db.orders_l,       {foreignKey: 'order_id',      targetKey: 'order_id',                            as: 'lines'});

db.orders_l.hasOne(db.item_sizes,    {foreignKey: 'itemsize_id',   sourceKey: 'itemsize_id',     constraints: false});
db.orders_l.hasOne(db.demands_l,     {foreignKey: 'line_id',       sourceKey: 'demand_line_id',  constraints: false});
db.orders_l.hasOne(db.receipts_l,    {foreignKey: 'line_id',       sourceKey: 'receipt_line_id', constraints: false});
db.orders_l.hasOne(db.issues_l,      {foreignKey: 'line_id',       sourceKey: 'issue_line_id',   constraints: false});
db.orders_l.belongsTo(db.orders,     {foreignKey: 'order_id',      targetKey: 'order_id'});

db.requests.hasOne(db.users,         {foreignKey: 'user_id',       sourceKey: 'requested_for',   constraints: false, as: '_for'});
db.requests.hasOne(db.users,         {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false, as: '_by'});
db.requests.hasMany(db.requests_l,   {foreignKey: 'request_id',    targetKey: 'request_id',                          as: 'lines'});

db.requests_l.hasOne(db.users,       {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false});
db.requests_l.hasOne(db.item_sizes,  {foreignKey: 'itemsize_id',   sourceKey: 'itemsize_id',     constraints: false});
db.requests_l.belongsTo(db.requests, {foreignKey: 'request_id',    targetKey: 'request_id'});

db.receipts.hasOne(db.users,         {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false});
db.receipts.hasOne(db.suppliers,     {foreignKey: 'supplier_id',   sourceKey: 'supplier_id',     constraints: false});
db.receipts.hasMany(db.receipts_l,   {foreignKey: 'receipt_id',    targetKey: 'receipt_id',                          as: 'lines'});

db.receipts_l.hasOne(db.stock,       {foreignKey: 'stock_id',      sourceKey: 'stock_id',        constraints: false});
db.receipts_l.belongsTo(db.receipts, {foreignKey: 'receipt_id',    targetKey: 'receipt_id'});

db.demands.hasOne(db.suppliers,      {foreignKey: 'supplier_id',   sourceKey: 'supplier_id',     constraints: false});
db.demands.hasOne(db.users,          {foreignKey: 'user_id',       sourceKey: 'user_id',         constraints: false});
db.demands.hasMany(db.demands_l,     {foreignKey: 'demand_id',     targetKey: 'demand_id',                           as: 'lines'});

db.demands_l.hasOne(db.item_sizes,   {foreignKey: 'itemsize_id',   sourceKey: 'itemsize_id',     constraints: false});
db.demands_l.belongsTo(db.demands,   {foreignKey: 'demand_id',     targetKey: 'demand_id'});

db.groups.belongsTo(db.categories,   {foreignKey: 'category_id',   targetKey: 'category_id'});
db.types.belongsTo(db.groups,        {foreignKey: 'group_id',      targetKey: 'group_id'});
db.subtypes.belongsTo(db.types,      {foreignKey: 'type_id',       targetKey: 'type_id'});

db.serials.belongsTo(db.item_sizes,  {foreignKey: 'itemsize_id',   targetKey: 'itemsize_id'});
db.serials.hasOne(db.issues_l,       {foreignKey: 'line_id',       sourceKey: 'issue_line_id',   constraints: false});

db.sequelize = seq;
db.Sequelize = Seq;
 
module.exports = db;
