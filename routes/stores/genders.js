module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/settings', li, pm.get, pm.check('access_settings'),          (req, res) => res.render('stores/settings/show'));

    app.get('/get/genders',    li, pm.check('access_genders', {send: true}), (req, res) => {
        m.genders.findAll({where: req.query})
        .then(genders => res.send({success: true, result: genders}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting genders: ${err.message}`});
        });
    });
    app.get('/get/gender',     li, pm.check('access_genders', {send: true}), (req, res) => {
        m.genders.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(gender => {
            if (!gender) res.send({success: false, message: 'Gender not found'})
            else         res.send({success: true, result: gender});
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting gender: ${err.message}`});
        });
    });

    app.put('/genders',       li,  pm.check('gender_edit',    {send: true}), (req, res) => {
        m.genders.update(
            {_gender: req.body.gender._gender},
            {where: {gender_id: req.body.gender.gender_id}}
        )
        .then(result => {
            if (!result) res.send({success: true, message: 'Gender not updated'})
            else         res.send({success: true, message: 'Gender updated'});
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error updating gender: ${err.message}`});
        });
    });
    
    app.post('/genders',      li,  pm.check('gender_add',     {send: true}), (req, res) => {
        m.genders.create({...req.body.gender, ...{user_id: req.user.user_id}})
        .then(gender => res.send({success: true, message: 'Gender created'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error creating gender: ${err.message}`});
        });
    });
    
    app.delete('/genders/:id', li, pm.check('gender_delete',  {send: true}), (req, res) => {
        m.genders.findOne({
            where: {gender_id: req.params.id},
            attributes: ['gender_id']
        })
        .then(gender => {
            if (!gender) res.send({success: false, message: 'Gender not found'})
            else {
                return m.items.update(
                    {gender_id: null},
                    {where: {gender_id: gender.gender_id}}
                )
                .then(result => {
                    return gender.destroy()
                    .then(result => {
                        if (!result) res.send({success: false, message: 'Gender not deleted'})
                        else         res.send({success: true,  message: 'Gender deleted'})
                    })
                    .catch(err => res.send({success: false, message: `Error deleting gender: ${err.message}`}))
                })
                .catch(err => res.send({success: false, message: `Error updating items: ${err.message}`}))
            };
        })
        .catch(err => res.send({success: false, message: `Error getting gender: ${err.message}`}));
    });
};