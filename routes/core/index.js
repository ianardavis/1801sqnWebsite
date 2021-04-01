module.exports = (fs, app, m, pm, op, li, send_error) => {
    let inc = {};
    require('../users/includes.js')(inc, m);
    require(`./notes`)(app, inc, pm, m, li, send_error);
};