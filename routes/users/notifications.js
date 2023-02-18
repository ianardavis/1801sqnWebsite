module.exports = (app, fn) => {
    app.get('/get/notifications', fn.loggedIn(), (req, res) => {
        fn.notifications.getAll(req.user.user_id)
        .then(notifications => res.send({success: true, result: notifications}))
        .catch(err => fn.send_error(res, err));
    });
};