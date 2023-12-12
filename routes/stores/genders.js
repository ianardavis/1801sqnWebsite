module.exports = (app, fn) => {
    app.get('/get/genders', fn.loggedIn(),                                             (req, res) => {
        fn.genders.findAll(req.query)
        .then(results => fn.sendRes('genders', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/gender',  fn.loggedIn(),                                             (req, res) => {
        fn.gender.get(req.query.where)
        .then(gender => res.send({success: true, result: gender}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/genders',     fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.genders.edit(req.body.gender.gender_id, {gender: req.body.gender.gender})
        .then(result => res.send({success: true, message: 'Gender updated'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.post('/genders',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.genders.create(gender)
        .then(gender => res.send({success: true, message: 'Gender created'}))
        .catch(err => fn.sendError(res, err));
    }); 
    
    app.delete('/genders',  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.genders.delete(req.body.gender_id_delete)
        .then(result => res.send({success: true,  message: 'Gender deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};