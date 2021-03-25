"use strict";
var fs   = require("fs"),
    path = require("path"),
    { Sequelize, DataTypes } = require("sequelize"),
    seq  = new Sequelize(
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
        var model = require(path.join(__dirname, file))(seq, DataTypes);
        db[model.name] = model;
    });
db.sequelize = seq;
db.Sequelize = Sequelize;
module.exports = db;