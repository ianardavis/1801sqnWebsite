"use strict";
 
var fs   = require("fs"),
    path = require("path"),
    Seq  = require("sequelize"),
    env  = process.env.NODE_ENV || "development",
    conf = require(path.join('..', 'config.json'))[env],
    seq  = new Seq(conf.database, conf.username, conf.password, conf),
    db   = {};
seq.dialect.supports.schemas = true;
 
fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = seq.import(path.join(__dirname, file));
        db[model.name] = model;
    });
 
// db.users.hasOne( db.ranks,       {foreignKey: 'rank_id',       sourceKey: 'rank_id',   constraints: false});
// db.users.hasOne( db.statuses,    {foreignKey: 'status_id',     sourceKey: 'status_id', constraints: false});
// db.users.hasMany(db.permissions, {foreignKey: 'user_id',       sourceKey: 'user_id'});
// db.users.hasMany(db.orders,      {foreignKey: 'ordered_for',   targetKey: 'user_id'});
// db.users.hasMany(db.requests,    {foreignKey: 'requested_for', targetKey: 'user_id'});
// db.users.hasMany(db.issues,      {foreignKey: 'issued_to',     targetKey: 'user_id'});
// db.adjusts.hasOne(   db.users,              {foreignKey: 'user_id',     sourceKey: 'user_id',  constraints: false});
// db.accounts.hasOne(   db.users,     {foreignKey: 'user_id',    sourceKey: 'user_id', constraints: false});
// db.issues.hasOne( db.users,       {foreignKey: 'user_id',  sourceKey: 'issued_to', constraints: false, as: 'user_to'});
// db.issues.hasOne( db.users,       {foreignKey: 'user_id',  sourceKey: 'user_id',   constraints: false, as: 'user_by'});
// db.issue_lines.hasOne(   db.users,              {foreignKey: 'user_id',       sourceKey: 'user_id',   constraints: false});
// db.issue_line_returns.hasOne(db.users,       {foreignKey: 'user_id',     sourceKey: 'user_id',       constraints: false});
// db.notes.hasOne(db.users, {foreignKey: 'user_id', sourceKey: 'user_id', constraints: false});
// db.orders.hasOne( db.users,       {foreignKey: 'user_id',  sourceKey: 'ordered_for', constraints: false, as: 'user_for'});
// db.orders.hasOne( db.users,       {foreignKey: 'user_id',  sourceKey: 'user_id',     constraints: false, as: 'user_by'});
// db.order_lines.hasOne(   db.users,              {foreignKey: 'user_id',       sourceKey: 'user_id', constraints: false});
// db.order_line_actions.hasOne(   db.users,       {foreignKey: 'user_id',       sourceKey: 'user_id', constraints: false});
// db.requests.hasOne( db.users,         {foreignKey: 'user_id',    sourceKey: 'requested_for', constraints: false, as: 'user_for'});
// db.requests.hasOne( db.users,         {foreignKey: 'user_id',    sourceKey: 'user_id',       constraints: false, as: 'user_by'});
// db.request_lines.hasOne(   db.users,    {foreignKey: 'user_id',    sourceKey: 'user_id',     constraints: false, as: 'user_add'});
// db.request_lines.hasOne(   db.users,    {foreignKey: 'user_id',    sourceKey: 'approved_by', constraints: false, as: 'user_approve'});
// db.receipts.hasOne( db.users,         {foreignKey: 'user_id',     sourceKey: 'user_id',     constraints: false});
// db.receipt_lines.hasOne(   db.users,     {foreignKey: 'user_id',     sourceKey: 'user_id',     constraints: false});
// db.demands.hasOne(   db.users,        {foreignKey: 'user_id',     sourceKey: 'user_id',     constraints: false});
// db.demand_lines.hasOne(   db.users,        {foreignKey: 'user_id',   sourceKey: 'user_id',         constraints: false});
// db.canteen_sessions.hasOne( db.users,         {foreignKey: 'user_id',    sourceKey: 'opened_by',  as: '_opened_by', constraints: false});
// db.canteen_sessions.hasOne( db.users,         {foreignKey: 'user_id',    sourceKey: 'closed_by',  as: '_closed_by', constraints: false});
// db.canteen_sales.hasOne( db.users,               {foreignKey: 'user_id', sourceKey: 'user_id', constraints: false});
// db.canteen_receipts.hasOne( db.users,                 {foreignKey: 'user_id',    sourceKey: 'user_id',    constraints: false});
// db.canteen_writeoffs.hasOne( db.users,                  {foreignKey: 'user_id',     sourceKey: 'user_id',      constraints: false});

db.sequelize = seq;
db.Sequelize = Seq;
 
module.exports = db;