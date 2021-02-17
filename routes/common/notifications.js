module.exports = (app, al, pm, m, db) => {
    app.get(`/${db}/get/notifications`, pm, al(`access_${db}`), (req, res) => {
        m.notifications.findAll({where: {user_id: req.user.user_id}})
        .then(notifications => res.send({success: true, result: notifications}))
        .catch(err => res.error.send(err, res));
    });
};