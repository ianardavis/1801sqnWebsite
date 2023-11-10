module.exports = (app, fn) => {
    app.get('/get/ranks', fn.loggedIn(), (req, res) => {
        fn.users.ranks.findAll(req.query)
        .then(results => fn.sendRes('ranks', res, results, req.query))
        .catch(err =>  fn.sendError(res, err));
    });
};