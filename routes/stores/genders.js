module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/settings',          pm, al('access_settings'),                 (req, res) => res.render('stores/settings/show'));

    app.get('/stores/get/genders',    pm, al('access_genders', {send: true}), (req, res) => {
        m.stores.genders.findAll({where: req.query})
        .then(genders => res.send({success: true, result: genders}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting genders: ${err.message}`});
        });
    });
    app.get('/stores/get/gender',     pm, al('access_genders', {send: true}), (req, res) => {
        m.stores.genders.findOne({
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

    app.put('/stores/genders',        pm, al('gender_edit',    {send: true}), (req, res) => {
        m.stores.genders.update(
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
    
    app.post('/stores/genders',       pm, al('gender_add',     {send: true}), (req, res) => {
        m.stores.genders.create({...req.body.gender, ...{user_id: req.user.user_id}})
        .then(gender => res.send({success: true, message: 'Gender created'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error creating gender: ${err.message}`});
        });
    });
    
    app.delete('/stores/genders/:id', pm, al('gender_delete',  {send: true}), (req, res) => {
        m.stores.genders.findOne({
            where: {gender_id: req.params.id},
            attributes: ['gender_id']
        })
        .then(gender => {
            if (!gender) res.send({success: false, message: 'Gender not found'})
            else {
                return m.stores.items.update(
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