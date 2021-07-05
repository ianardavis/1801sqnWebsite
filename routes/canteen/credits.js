module.exports = (app, m, fn) => {
    app.get('/get/credits', fn.loggedIn(), fn.permissions.check('access_credits'), (req, res) => {
        m.credits.findAll({include: [fn.inc.users.user()]})
        .then(credits => res.send({success: true, result: credits}))
        .catch(err => fn.send_error(res, err));
    });
};