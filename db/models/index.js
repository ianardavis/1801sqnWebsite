"use strict";
 
var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
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
 
db.users.hasOne(db.ranks,                    {foreignKey: 'rank_id',     sourceKey: '_rank',       constraints: false});
db.users.hasOne(db.genders,                  {foreignKey: 'gender_id',   sourceKey: '_gender',     constraints: false});
db.users.hasOne(db.statuses,                 {foreignKey: 'status_id',   sourceKey: '_status',     constraints: false});
db.users.hasOne(db.permissions,              {foreignKey: 'user_id',     sourceKey: 'user_id',     constraints: false});
db.items.hasOne (db.genders,                 {foreignKey: 'gender_id',   sourceKey: '_gender',     constraints: false});
db.items.hasOne (db.categories,              {foreignKey: 'category_id', sourceKey: '_category',   constraints: false});
db.items.hasOne (db.groups,                  {foreignKey: 'group_id',    sourceKey: '_group',      constraints: false});
db.items.hasOne (db.types,                   {foreignKey: 'type_id',     sourceKey: '_type',       constraints: false});
db.items.hasOne (db.subtypes,                {foreignKey: 'subtype_id',  sourceKey: '_sub_type',   constraints: false});
db.items.hasOne (db.suppliers,               {foreignKey: 'supplier_id', sourceKey: 'supplier_id', constraints: false});
db.items.hasMany(db.items_sizes,             {foreignKey: 'item_id',     targetKey: 'item_id',     as: 'sizes'});
db.items_sizes.hasOne (db.sizes,             {foreignKey: 'size_id',     sourceKey: 'size_id',     constraints: false});
db.items_sizes.hasOne (db.items,             {foreignKey: 'item_id',     sourceKey: 'item_id',     constraints: false});
db.items_sizes.hasMany(db.items_nsns,        {foreignKey: 'stock_id',    targetKey: 'stock_id',    as: 'nsns'});
db.items_sizes.hasMany(db.orders,            {foreignKey: 'stock_id',    targetKey: 'stock_id'});
db.items_sizes.hasMany(db.issues,            {foreignKey: 'stock_id',    targetKey: 'stock_id'});
db.items_sizes.hasMany(db.items_locations,   {foreignKey: 'stock_id',    targetKey: 'stock_id',    as: 'locations'});
db.items_locations.belongsTo(db.items_sizes, {foreignKey: 'stock_id',    targetKey: 'stock_id',    as: 'size'});
db.items_nsns.belongsTo     (db.items_sizes, {foreignKey: 'stock_id',    targetKey: 'stock_id',    as: 'size'});
db.issues.hasOne(db.users,                   {foreignKey: 'user_id',     sourceKey: 'issued_to',   constraints: false, as: 'issuedTo'});
db.issues.hasOne(db.users,                   {foreignKey: 'user_id',     sourceKey: 'issued_by',   constraints: false, as: 'issuedBy'});
db.issues.hasOne(db.users,                   {foreignKey: 'user_id',     sourceKey: 'returned_to', constraints: false, as: 'returnedTo'});
db.issues.hasOne(db.items_sizes,             {foreignKey: 'stock_id',    sourceKey: 'stock_id',    constraints: false, as: 'size'});
db.issues.hasOne(db.loancardslines,          {foreignKey: 'line_id',     sourceKey: 'line_id',     constraints: false, as: 'lc_line'});
db.issues.hasOne(db.items_locations,         {foreignKey: 'location_id', sourceKey: 'issue_location',  constraints: false, as: 'issueLocation'});
db.issues.hasOne(db.items_locations,         {foreignKey: 'location_id', sourceKey: 'return_location', constraints: false, as: 'returnLocation'});
db.loancardslines.hasOne(db.loancards,       {foreignKey: 'loancard_id', sourceKey: 'loancard_id', constraints: false, as: 'lc'});
db.loancardslines.hasOne(db.items_sizes,     {foreignKey: 'stock_id',    sourceKey: 'stock_id',    constraints: false, as: 'item'});
db.loancardslines.hasOne(db.users,           {foreignKey: 'user_id',     sourceKey: 'received_by', constraints: false, as: 'receivedBy'});
db.loancards.hasMany(db.loancardslines,      {foreignKey: 'loancard_id', targetKey: 'loancard_id', as: 'lines'});
db.loancards.hasOne(db.users,                {foreignKey: 'user_id',     sourceKey: 'issued_to',   constraints: false, as: 'issuedTo'});
db.loancards.hasOne(db.users,                {foreignKey: 'user_id',     sourceKey: 'user_id',     constraints: false, as: 'issuedBy'});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
 
module.exports = db;