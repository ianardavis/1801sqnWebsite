module.exports = (app, fn) => {
    app.get('/get/sites/own', fn.loggedIn(), (req, res) => {
        fn.sites.findForUser(req.user.user_id)
        .then(sites => res.send({success: true, result: sites}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/sites/user/:id', fn.loggedIn(), (req, res) => {
        fn.sites.findForUser(req.params.id)
        .then(sites => res.send({success: true, result: sites}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/site/current',   fn.loggedIn(), (req, res) => {
        fn.sites.findCurrent(req.session.site_id)
        .then(site => res.send({success: true, result: site}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/sites/switch/:id', fn.loggedIn(), (req, res) => {
        fn.sites.switch(req, req.params.id)
        .then(result => res.send({success: true, result: true}))
        .catch(err => fn.sendError(res, err));
    });
    
    // app.delete('/sites',  fn.loggedIn(), (req, res) => {
    //     fn.notes.delete(req.body.note_id_delete)
    //     .then(note => res.send({success: true, message: 'Note deleted'}))
    //     .catch(err => fn.sendError(res, err));
    // });
};