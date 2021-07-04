module.exports = (app, m, inc, fn) => {
    app.get('/sales/:id',        fn.loggedIn(), fn.permissions.get('access_sales'),   (req, res) => res.render('canteen/sales/show'));

    app.get('/get/sales',        fn.loggedIn(), fn.permissions.check('access_sales'), (req, res) => {
        m.sales.findAll({
            where: req.query,
            include: [
                inc.sale_lines({item: true}),
                inc.user()
            ]
        })
        .then(sales => res.send({success: true, result: sales}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/sale',         fn.loggedIn(), fn.permissions.check('access_sales'), (req, res) => {
        fn.get(
            'sales',
            req.query,
            [inc.user()]
        )
        .then(sale => res.send({success: true,  result: sale}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/sale_current', fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        m.sessions.findAll({where: {status: 1}})
        .then(sessions => {
            if (sessions.length !== 1) fn.send_error(res, `${sessions.length} session(s) open`)
            else {
                return m.sales.findOrCreate({
                    where: {
                        session_id: sessions[0].session_id,
                        user_id:    req.user.user_id,
                        status:    1
                    }
                })
                .then(([sale, created]) => res.send({success: true, result: sale.sale_id}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/sale_lines',   fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        m.sale_lines.findAll({
            where:   req.query,
            include: [inc.item()]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => fn.send_error(res, err))
    });

    app.post('/sale_lines',      fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        if (!req.body.line) fn.send_error(res, 'No line')
        else {
            fn.sales.lines.create(req.body.line)
            .then(result => res.send({success: true, message: 'Line saved'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    
    app.put('/sale_lines',       fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        if (!req.body.line) fn.send_error(res, 'No line specified')
        else {
            fn.sales.lines.edit(req.body.line)
            .then(result => res.send({success: true, message: 'Line updated'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/sales',            fn.loggedIn(), fn.permissions.check('access_pos'),   (req, res) => {
        fn.sales.complete(
            req.body.sale_id,
            req.body.sale,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: 'Sale Completed'}))
        .catch(err => fn.send_error(res, err));
    });
};