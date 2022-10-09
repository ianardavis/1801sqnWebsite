module.exports = function (m) {
    const fs = require("fs");
    let path = require("path");
    fs
    .readdirSync(__dirname)
    .filter(file => file !== "index.js")
    .forEach(file => {
        require(path.join(__dirname, file))(m)
    });
};