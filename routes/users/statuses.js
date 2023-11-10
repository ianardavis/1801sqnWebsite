module.exports = (app, fn) => {
    app.get('/get/statuses', fn.loggedIn(), (req, res) => {
        fn.users.statuses.findAll(req.query)
        .then(results => fn.sendRes('statuses', res, results, req.query))
        .catch(err =>    fn.sendError(res, err));
    });
};