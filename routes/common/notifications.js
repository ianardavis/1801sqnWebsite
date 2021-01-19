module.exports = (app, allowed, permissions, m, db) => {
    app.get(`/${db}/get/notifications`, permissions, allowed(`access_${db}`), (req, res) => {
        m.notifications.findAll({where: {user_id: req.user.user_id}})
        .then(notifications => res.send({success: true, result: notifications}))
        .catch(err => res.error.send(err, res));
    });
};