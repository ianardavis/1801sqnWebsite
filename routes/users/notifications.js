module.exports = (app, fn) => {
    app.get('/get/notifications', fn.loggedIn(), (req, res) => {
        fn.notifications.get_all(req.user.user_id)
        .then(notifications => res.send({success: true, result: notifications}))
        .catch(err => fn.send_error(res, err));
    });
};