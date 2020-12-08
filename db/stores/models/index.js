"use strict";
var fs   = require("fs"),
    path = require("path"),
    Seq  = require("sequelize"),
    seq  = new Seq(
        'stores',
        process.env.DB_STORES_USERNAME,
        process.env.DB_STORES_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: "mysql",
            logging: (process.env.DB_LOGGING === 1)
        }
    ),
    db  = {};
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