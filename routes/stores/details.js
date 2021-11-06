module.exports = (app, m, fn) => {
    app.get('/get/details',    fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        m.details.findAll({
            where: JSON.parse(req.query.where),
            ...fn.sort(req.query.sort)
        })
        .then(details => res.send({success: true, result: details}))
        .catch(err =>    fn.send_error(res, err));
    });
    app.get('/get/detail',     fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        fn.get(
            'details',
            JSON.parse(req.query.where)
        )
        .then(detail => res.send({success: true, result: detail}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/details',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        if      (!req.body.detail.name) fn.send_error(res, 'Name not submitted')
        else if (!req.body.detail.name) fn.send_error(res, 'Value not submitted')
        else {
            m.details.findOrCreate({
                where: {
                    size_id: req.body.detail.size_id,
                    name:    req.body.detail.name
                },
                defaults: {value: req.body.detail.value}
            })
            .then(([detail, created]) => {
                if (!created) fn.send_error(res, 'Detail already exists')
                else res.send({success: true, message: 'Detail saved'});
            })
            .catch(err => fn.send_error(res, err))
        };
    });
    app.put('/detail',         fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.put(
            'details',
            {detail_id: req.body.detail_id},
            req.body.detail
        )
        .then(result => res.send({success: true, message: 'Detail saved'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/details/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        m.details.destroy({where: {detail_id: req.params.id}})
        .then(result => {
            if (!result) fn.send_error(res, 'Detail not deleted')
            else res.send({success: true, message: 'Detail deleted'})
        })
        .catch(err => fn.send_error(res, err));
    });
};