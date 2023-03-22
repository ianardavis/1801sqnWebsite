module.exports = function (fs, m, fn) {
    fs
    .readdirSync(__dirname)
    .forEach(file => {
        if (file !=="index.js") {
            if (file.indexOf(".js") !== -1) {
                require(`./${file}`)(m, fn);
            } else {
                require(`./${file}`)(fs, m, fn);
            };
        };
    });

};