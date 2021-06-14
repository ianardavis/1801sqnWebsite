module.exports = (app, m, inc, fn) => {
    app.get('/get/genders',    fn.loggedIn(), fn.permissions.check('access_genders'), (req, res) => {
        m.genders.findAll({where: req.query})
        .then(genders => res.send({success: true, result: genders}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/gender',     fn.loggedIn(), fn.permissions.check('access_genders'), (req, res) => {
        m.genders.findOne({
            where:   req.query,
            include: []
        })
        .then(gender => {
            if (!gender) fn.send_error(res, 'Gender not found')
            else         res.send({success: true, result: gender});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/genders',        fn.loggedIn(), fn.permissions.check('gender_edit'),    (req, res) => {
        m.genders.update(
            {gender: req.body.gender.gender},
            {where: {gender_id: req.body.gender.gender_id}}
        )
        .then(result => {
            if (!result) fn.send_error(res, 'Gender not updated')
            else         res.send({success: true, message: 'Gender updated'});
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/genders',       fn.loggedIn(), fn.permissions.check('gender_add'),     (req, res) => {
        m.genders.create({...req.body.gender, ...{user_id: req.user.user_id}})
        .then(gender => res.send({success: true, message: 'Gender created'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/genders/:id', fn.loggedIn(), fn.permissions.check('gender_delete'),  (req, res) => {
        m.genders.findOne({
            where: {gender_id: req.params.id},
            attributes: ['gender_id']
        })
        .then(gender => {
            if (!gender) fn.send_error(res, 'Gender not found')
            else {
                return m.items.update(
                    {gender_id: null},
                    {where: {gender_id: gender.gender_id}}
                )
                .then(result => {
                    return gender.destroy()
                    .then(result => {
                        if (!result) fn.send_error(res, 'Gender not deleted')
                        else         res.send({success: true,  message: 'Gender deleted'})
                    })
                    .catch(err => fn.send_error(res, err))
                })
                .catch(err => fn.send_error(res, err))
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};