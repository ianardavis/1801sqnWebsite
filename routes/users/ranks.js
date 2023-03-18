module.exports = (app, fn) => {
    app.get('/get/ranks', fn.loggedIn(), (req, res) => {
        fn.users.ranks.get_all(
            req.query.where,
            fn.pagination(req.query)
        )
        .then(results => fn.send_res('ranks', res, results, req.query))
        .catch(err =>  fn.send_error(res, err));
    });
};