module.exports = (app, fn) => {
    app.get('/get/genders',    fn.loggedIn(),                                             (req, res) => {
        fn.genders.getAll(req.query.where, fn.pagination(req.query))
        .then(results => fn.send_res('genders', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/gender',     fn.loggedIn(),                                             (req, res) => {
        fn.gender.get(req.query.where)
        .then(gender => res.send({success: true, result: gender}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/genders',        fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.genders.edit(req.body.gender.gender_id, {gender: req.body.gender.gender})
        .then(result => res.send({success: true, message: 'Gender updated'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/genders',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.genders.create(gender)
        .then(gender => res.send({success: true, message: 'Gender created'}))
        .catch(err => fn.send_error(res, err));
    }); 
    
    app.delete('/genders/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.genders.delete(req.params.id)
        .then(result => res.send({success: true,  message: 'Gender deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};