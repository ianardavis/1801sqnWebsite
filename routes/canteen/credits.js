module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/credits', li, pm.check('access_credits', {send: true}), (req, res) => {
        m.credits.findAll({include: [inc.users()]})
        .then(credits => res.send({success: true, result: credits}))
        .catch(err => send_error(res, err));
    });
};