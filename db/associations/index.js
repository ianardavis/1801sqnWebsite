module.exports = function (m) {
    let fs   = require("fs"),
        path = require("path");
    fs
        .readdirSync(__dirname)
        .filter(file => {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(file => {
            require(path.join(__dirname, file))(m)
        });
};