module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/notifications', (req, res) => {
        m.notifications.findAll({where: {user_id: req.user.user_id}})
        .then(notifications => res.send({success: true, result: notifications}))
        .catch(err => res.error.send(err, res));
    });
};