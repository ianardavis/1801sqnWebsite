module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/notifications', li, (req, res) => {
        m.notifications.findAll({where: {user_id: req.user.user_id}})
        .then(notifications => res.send({success: true, result: notifications}))
        .catch(err => send_error(res, err));
    });
};