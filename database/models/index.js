"use strict";
const fs   = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
let db = {};
let seq = new Sequelize(
    'squadron',
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host:     process.env.DB_HOST,
        dialect:  process.env.DB_DIALECT,
        logging: (process.env.DB_LOGGING === 1)
    }
);
seq.dialect.supports.schemas = true;
fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(seq, DataTypes);
        db[model.name] = model;
    });

db.sequelize = seq;
db.Sequelize = Sequelize;
module.exports = db;