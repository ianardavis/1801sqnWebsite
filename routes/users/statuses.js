module.exports = (app, fn) => {
    app.get('/get/statuses', fn.loggedIn(), (req, res) => {
        fn.users.statuses.get_all(req.query)
        .then(results => fn.send_res('statuses', res, results, req.query))
        .catch(err =>    fn.send_error(res, err));
    });
};