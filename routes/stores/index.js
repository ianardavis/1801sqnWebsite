const mw = require('../../config/middleware'),
      fn = require('../../db/functions');


//root
module.exports = (app, m) => {
    app.get('/stores', mw.isLoggedIn, (req, res) => {
        res.render('stores/index');
    });
};
