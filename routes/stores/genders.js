module.exports = (app, m, fn) => {
    app.get('/get/genders',    fn.loggedIn(),                                             (req, res) => {
        m.genders.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('genders', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/gender',     fn.loggedIn(),                                             (req, res) => {
        fn.get(
            'genders',
            req.query.where
        )
        .then(gender => res.send({success: true, result: gender}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/genders',        fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.put(
            'genders',
            {gender: req.body.gender.gender},
            {gender_id: req.body.gender.gender_id}
        )
        .then(result => res.send({success: true, message: 'Gender updated'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/genders',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.genders.create({...req.body.gender, ...{user_id: req.user.user_id}})
        .then(gender => res.send({success: true, message: 'Gender created'}))
        .catch(err => fn.send_error(res, err));
    }); 
    
    app.delete('/genders/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'genders',
            {gender_id: req.params.id}
        )
        .then(gender => {
            m.items.update(
                {gender_id: null},
                {where: {gender_id: gender.gender_id}}
            )
            .then(result => {
                gender.destroy()
                .then(result => {
                    if (!result) fn.send_error(res, 'Gender not deleted')
                    else         res.send({success: true,  message: 'Gender deleted'})
                })
                .catch(err => fn.send_error(res, err))
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};