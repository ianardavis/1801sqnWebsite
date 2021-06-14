module.exports = function (app, m) {
    let fs = require("fs"), fn = {};
    fn.op = require('sequelize').Op;
    require(`${process.env.ROOT}/middleware/loggedIn.js`)(fn);
    require(`${process.env.ROOT}/middleware/permissions.js`)(m.permissions, fn);
    require(`${process.env.ROOT}/functions`)(fs, m, fn);
    fs
        .readdirSync(__dirname)
        .filter(e => e.indexOf(".") === -1)
        .forEach(folder => require(`./${folder}`)(fs, app, m, fn));

    app.get("*",                (req, res) => res.render("404"));
    app.get("/get/*",   fn.loggedIn(), (req, res) => fn.send_error(res, 'Invalid request'));
    app.get("/count/*", fn.loggedIn(), (req, res) => fn.send_error(res, 'Invalid request'));
    app.get("/sum/*",   fn.loggedIn(), (req, res) => fn.send_error(res, 'Invalid request'));
};