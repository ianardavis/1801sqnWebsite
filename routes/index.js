module.exports = function (app, m) {
    const fs = require('fs');
    let fn = {};
    require(`${process.env.ROOT}/middleware/loggedIn.js`)(fn);
    require(`${process.env.ROOT}/middleware/permissions.js`)(m.permissions, fn);
    require(`${process.env.ROOT}/includes`) (fs, m, fn);
    require(`${process.env.ROOT}/functions`)(fs, m, fn);
    
    fs
    .readdirSync(__dirname)
    .filter(e => e.indexOf('.') === -1)
    .forEach(folder => require(`./${folder}`)(fs, app, fn));

    app.get('/get/*',   fn.loggedIn(), (req, res) => fn.send_error(res, 'Invalid GET request'));
    app.get('/count/*', fn.loggedIn(), (req, res) => fn.send_error(res, 'Invalid COUNT request'));
    app.get('/sum/*',   fn.loggedIn(), (req, res) => fn.send_error(res, 'Invalid SUM request'));
    app.get('*',                       (req, res) => res.render('site/404'));
    app.put('*',                       (req, res) => res.send({success: false, message: 'Unknown request'}));
    app.post('*',                      (req, res) => res.send({success: false, message: 'Unknown request'}));
    app.delete('*',                    (req, res) => res.send({success: false, message: 'Unknown request'}));
};