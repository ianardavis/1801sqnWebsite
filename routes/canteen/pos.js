module.exports = (app, fn) => {
    app.get('/pos', fn.loggedIn(), fn.permissions.get('pos_user'), (req, res) => {
        fn.sessions.get_current()
        .then(sessions => res.render('canteen/pos/show'))
        .catch(err => fn.send_error(res, err));
    });
};