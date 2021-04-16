module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/settings',       li, pm.get, pm.check('access_settings'),              (req, res) => res.render('stores/settings/show'));

    app.get('/get/genders',    li,         pm.check('access_genders', {send: true}), (req, res) => {
        m.genders.findAll({where: req.query})
        .then(genders => res.send({success: true, result: genders}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/gender',     li,         pm.check('access_genders', {send: true}), (req, res) => {
        m.genders.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(gender => {
            if (!gender) send_error(res, 'Gender not found')
            else         res.send({success: true, result: gender});
        })
        .catch(err => send_error(res, err));
    });

    app.put('/genders',        li,         pm.check('gender_edit',    {send: true}), (req, res) => {
        m.genders.update(
            {gender: req.body.gender.gender},
            {where: {gender_id: req.body.gender.gender_id}}
        )
        .then(result => {
            if (!result) send_error(res, 'Gender not updated')
            else         res.send({success: true, message: 'Gender updated'});
        })
        .catch(err => send_error(res, err));
    });
    
    app.post('/genders',       li,         pm.check('gender_add',     {send: true}), (req, res) => {
        m.genders.create({...req.body.gender, ...{user_id: req.user.user_id}})
        .then(gender => res.send({success: true, message: 'Gender created'}))
        .catch(err => send_error(res, err));
    });
    
    app.delete('/genders/:id', li,         pm.check('gender_delete',  {send: true}), (req, res) => {
        m.genders.findOne({
            where: {gender_id: req.params.id},
            attributes: ['gender_id']
        })
        .then(gender => {
            if (!gender) send_error(res, 'Gender not found')
            else {
                return m.items.update(
                    {gender_id: null},
                    {where: {gender_id: gender.gender_id}}
                )
                .then(result => {
                    return gender.destroy()
                    .then(result => {
                        if (!result) send_error(res, 'Gender not deleted')
                        else         res.send({success: true,  message: 'Gender deleted'})
                    })
                    .catch(err => send_error(res, err))
                })
                .catch(err => send_error(res, err))
            };
        })
        .catch(err => send_error(res, err));
    });
};