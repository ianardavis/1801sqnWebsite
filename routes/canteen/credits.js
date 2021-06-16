module.exports = (app, m, inc, fn) => {
    app.get('/get/credits', fn.loggedIn(), fn.permissions.check('access_credits'), (req, res) => {
        m.credits.findAll({include: [inc.user()]})
        .then(credits => res.send({success: true, result: credits}))
        .catch(err => fn.send_error(res, err));
    });
};