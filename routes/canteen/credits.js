module.exports = (app, m, fn) => {
    app.get('/get/credits', fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        m.credits.findAll({
            include: [fn.inc.users.user()],
            ...fn.sort(req.query.sort)
        })
        .then(credits => res.send({success: true, result: credits}))
        .catch(err => fn.send_error(res, err));
    });
};