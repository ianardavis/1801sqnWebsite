module.exports = (app, m, inc, fn) => {
    app.get('/get/notifications', fn.loggedIn(), (req, res) => {
        m.notifications.findAll({where: {user_id: req.user.user_id}})
        .then(notifications => res.send({success: true, result: notifications}))
        .catch(err => fn.send_error(res, err));
    });
};