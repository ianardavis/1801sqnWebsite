module.exports = (fs, app, m, fn) => {
    let inc = {};
    require('../users/includes.js')(inc, m);
    require(`./notes`)(app, m, inc, fn);
};