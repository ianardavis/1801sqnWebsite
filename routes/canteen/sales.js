module.exports = (app, m, fn) => {
    app.get('/sales/:id',        fn.loggedIn(), fn.permissions.get('pos_user'),   (req, res) => res.render('canteen/sales/show'));

    app.get('/get/sales',        fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        m.sales.findAndCountAll({
            where: req.query.where,
            include: [
                fn.inc.canteen.sale_lines({item: true}),
                fn.inc.users.user()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('sales', res, results, req.query))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/sale',         fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.get(
            'sales',
            req.query.where,
            [fn.inc.users.user()]
        )
        .then(sale => res.send({success: true,  result: sale}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/sale_current', fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
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
    app.get('/get/sale_lines',   fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        m.sale_lines.findAndCountAll({
            where:   req.query.where,
            include: [fn.inc.canteen.item()],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('lines', res, results, req.query))
        .catch(err => fn.send_error(res, err))
    });

    app.post('/sale_lines',      fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        if (!req.body.line) fn.send_error(res, 'No line')
        else {
            fn.sales.lines.create(req.body.line)
            .then(result => res.send({success: true, message: 'Line saved'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    
    app.put('/sale_lines',       fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        if (!req.body.line) fn.send_error(res, 'No line specified')
        else {
            fn.sales.lines.edit(req.body.line)
            .then(result => res.send({success: true, message: 'Line updated'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/sales',            fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.complete(
            req.body.sale_id,
            req.body.sale,
            req.user.user_id
        )
        .then(change => res.send({success: true, change: change}))
        .catch(err => fn.send_error(res, err));
    });
};