module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/details',    li, pm.check('access_details', {send: true}), (req, res) => {
        m.details.findAll({where: req.query})
        .then(details => res.send({success: true, result: details}))
        .catch(err =>    send_error(res, err));
    });
    app.get('/get/detail',     li, pm.check('access_details', {send: true}), (req, res) => {
        m.details.findOne({where: req.query})
        .then(detail => res.send({success: true, result: detail}))
        .catch(err => send_error(res, err));
    });

    app.post('/details',       li, pm.check('detail_add',     {send: true}), (req, res) => {
        if      (!req.body.detail.name) send_error(res, 'Name not submitted')
        else if (!req.body.detail.name) send_error(res, 'Value not submitted')
        else {
            m.details.findOrCreate({
                where: {
                    size_id: req.body.detail.size_id,
                    name:    req.body.detail.name
                },
                defaults: {value: req.body.detail.value}
            })
            .then(([detail, created]) => {
                if (!created) send_error(res, 'Detail already exists')
                else res.send({success: true, message: 'Detail saved'});
            })
            .catch(err => send_error(res, err))
        };
    });
    app.put('/detail',         li, pm.check('detail_edit',    {send: true}), (req, res) => {
        m.details.update(
            req.body.detail,
            {where: {detail_id: req.body.detail_id}}
        )
        .then(result => res.send({success: true, message: 'Detail saved'}))
        .catch(err => send_error(res, err));
    });

    app.delete('/details/:id', li, pm.check('detail_delete',  {send: true}), (req, res) => {
        m.details.destroy({where: {detail_id: req.params.id}})
        .then(result => {
            if (!result) send_error(res, 'Detail not deleted')
            else res.send({success: true, message: 'Detail deleted'})
        })
        .catch(err => send_error(res, err));
    });
};