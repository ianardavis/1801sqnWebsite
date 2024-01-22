module.exports = (app, fn) => {
    app.get('/get/actions',      fn.loggedIn, (req, res) => {
        fn.actions.findAll(req.query)
        .then(results => fn.sendRes('actions', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/action',       fn.loggedIn, (req, res) => {
        fn.actions.find(req.query.where)
        .then(action => res.send({success: true, result: action}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/action_links', fn.loggedIn, (req, res) => {
        fn.actions.links.findAll(req.query)
        .then(links => res.send({success: true, result: links}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/action_link',  fn.loggedIn, (req, res) => {
        fn.actions.links.find(req.query.where)
        .then(link => res.send({success: true, result: link}))
        .catch(err => fn.sendError(res, err));
    });
};