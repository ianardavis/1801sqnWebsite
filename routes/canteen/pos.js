module.exports = (app, fn) => {
    app.get('/pos', fn.loggedIn(), fn.permissions.get('pos_user'), (req, res) => {
        fn.sessions.findCurrent()
        .then(sessions => res.render('canteen/pos/show'))
        .catch(err => fn.sendError(res, err));
    });
};