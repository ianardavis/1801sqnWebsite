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
    
db.sequelize = seq;
db.Sequelize = Seq;
 
module.exports = db;