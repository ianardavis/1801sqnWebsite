"use strict";
 
var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "production";
var config = require(path.join(__dirname, '..', '..', 'config', 'config.json'))[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db = {};
 
 
fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });
 
Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});
 
db.users.hasOne(db.ranks,       {foreignKey: 'rank_id',       sourceKey: 'rank_id',   constraints: false});
db.users.hasOne(db.genders,     {foreignKey: 'gender_id',     sourceKey: 'gender_id', constraints: false});
db.users.hasOne(db.statuses,    {foreignKey: 'status_id',     sourceKey: 'status_id', constraints: false});
db.users.hasOne(db.permissions, {foreignKey: 'user_id',       sourceKey: 'user_id',   constraints: false});
db.users.hasMany(db.orders,     {foreignKey: 'ordered_for',   targetKey: 'user_id'});
db.users.hasMany(db.loancards,  {foreignKey: 'issued_to',     targetKey: 'user_id'});
db.users.hasMany(db.requests,   {foreignKey: 'requested_for', targetKey: 'user_id'});
db.users.hasMany(db.issues,     {foreignKey: 'issued_to',     targetKey: 'user_id'});

db.items.hasOne (db.genders,    {foreignKey: 'gender_id',   sourceKey: 'gender_id',   constraints: false});
db.items.hasOne (db.categories, {foreignKey: 'category_id', sourceKey: 'category_id', constraints: false});
db.items.hasOne (db.groups,     {foreignKey: 'group_id',    sourceKey: 'group_id',    constraints: false});
db.items.hasOne (db.types,      {foreignKey: 'type_id',     sourceKey: 'type_id',     constraints: false});
db.items.hasOne (db.subtypes,   {foreignKey: 'subtype_id',  sourceKey: 'subtype_id',  constraints: false});
db.items.hasMany(db.item_sizes, {foreignKey: 'item_id',     targetKey: 'item_id',     as: 'sizes'});

db.item_sizes.hasOne (db.suppliers,      {foreignKey: 'supplier_id', sourceKey: 'supplier_id', constraints: false});
db.item_sizes.hasOne (db.sizes,          {foreignKey: 'size_id',     sourceKey: 'size_id',     constraints: false});
db.item_sizes.hasOne (db.items,          {foreignKey: 'item_id',     sourceKey: 'item_id',     constraints: false});
db.item_sizes.hasMany(db.item_nsns,      {foreignKey: 'stock_id',    targetKey: 'stock_id',    as: 'nsns'});
db.item_sizes.hasMany(db.orders,         {foreignKey: 'stock_id',    targetKey: 'stock_id'});
db.item_sizes.hasMany(db.issues,         {foreignKey: 'stock_id',    targetKey: 'stock_id'});
db.item_sizes.hasMany(db.item_locations, {foreignKey: 'stock_id',    targetKey: 'stock_id',    as: 'locations'});

db.item_locations.belongsTo(db.item_sizes, {foreignKey: 'stock_id', targetKey: 'stock_id', as: 'size'});

db.item_nsns.belongsTo(db.item_sizes, {foreignKey: 'stock_id', targetKey: 'stock_id', as: 'size'});

db.issues.hasOne(db.users,          {foreignKey: 'user_id',     sourceKey: 'issued_to',   constraints: false, as: 'issuedTo'});
db.issues.hasOne(db.users,          {foreignKey: 'user_id',     sourceKey: 'issued_by',   constraints: false, as: 'issuedBy'});
db.issues.hasOne(db.users,          {foreignKey: 'user_id',     sourceKey: 'returned_to', constraints: false, as: 'returnedTo'});
db.issues.hasOne(db.item_sizes,     {foreignKey: 'stock_id',    sourceKey: 'stock_id',    constraints: false, as: 'size'});
db.issues.hasOne(db.loancardlines,  {foreignKey: 'line_id',     sourceKey: 'line_id',     constraints: false, as: 'lc_line'});
db.issues.hasOne(db.item_locations, {foreignKey: 'location_id', sourceKey: 'issue_location',  constraints: false, as: 'issueLocation'});
db.issues.hasOne(db.item_locations, {foreignKey: 'location_id', sourceKey: 'return_location', constraints: false, as: 'returnLocation'});

db.loancardlines.hasOne(db.loancards,  {foreignKey: 'loancard_id', sourceKey: 'loancard_id', constraints: false, as: 'lc'});
db.loancardlines.hasOne(db.item_sizes, {foreignKey: 'stock_id',    sourceKey: 'stock_id',    constraints: false, as: 'item'});
db.loancardlines.hasOne(db.users,      {foreignKey: 'user_id',     sourceKey: 'received_by', constraints: false, as: 'receivedBy'});
db.loancardlines.hasOne(db.item_nsns,  {foreignKey: 'nsn_id',      sourceKey: 'nsn_id',      constraints: false, as: 'nsn'});

db.loancards.hasMany(db.loancardlines, {foreignKey: 'loancard_id', targetKey: 'loancard_id', as: 'lines'});
db.loancards.hasOne(db.users,          {foreignKey: 'user_id',     sourceKey: 'issued_to',   constraints: false, as: 'issuedTo'});
db.loancards.hasOne(db.users,          {foreignKey: 'user_id',     sourceKey: 'user_id',     constraints: false, as: 'issuedBy'});

db.orders.hasOne(db.item_sizes, {foreignKey: 'stock_id',    sourceKey: 'stock_id',    constraints: false, as: 'size'});
db.orders.hasOne(db.users,      {foreignKey: 'user_id',     sourceKey: 'ordered_for', constraints: false, as: 'orderedFor'});
db.orders.hasOne(db.users,      {foreignKey: 'user_id',     sourceKey: 'ordered_by',  constraints: false, as: 'orderedBy'});
db.orders.hasOne(db.demands,    {foreignKey: 'demand_id',   sourceKey: 'demand_id',   constraints: false});
db.orders.hasOne(db.receipts,   {foreignKey: 'receipt_id',  sourceKey: 'receipt_id',  constraints: false});
db.orders.hasOne(db.issues,     {foreignKey: 'issue_id',    sourceKey: 'issue_id',    constraints: false});

db.requests.hasOne(db.item_sizes, {foreignKey: 'stock_id',   sourceKey: 'stock_id',      constraints: false, as: 'size'});
db.requests.hasOne(db.users,      {foreignKey: 'user_id',    sourceKey: 'requested_for', constraints: false, as: 'requestedFor'});
db.requests.hasOne(db.users,      {foreignKey: 'user_id',    sourceKey: 'requested_by',  constraints: false, as: 'requestedBy'});
db.requests.hasOne(db.users,      {foreignKey: 'user_id',    sourceKey: 'approved_by',   constraints: false, as: 'approvedBy'});
db.requests.hasOne(db.orders,     {foreignKey: 'order_id',   sourceKey: 'order_id',      constraints: false});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
 
module.exports = db;