const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let utils = require(process.env.ROOT + '/fn/utils'),
        includes = {
            accounts: [inc.users()],
            adjusts: [
                inc.users(), 
                inc.stock({as: 'stock'})
            ],
            demands: [
                inc.demand_lines(),
                inc.users(),
                inc.suppliers({as: 'supplier'})
            ],
            demand_lines: [
                inc.sizes({stock: true}),
                inc.receipt_lines({as: 'receipt_line', receipts: true})
            ],
            issues: [
                inc.users({as: '_to'}), 
                inc.users({as: '_by'}),
                inc.issue_lines()
            ],
            issue_lines: [
                inc.issues(),
                inc.nsns({as: 'nsn'}),
                inc.serials({as: 'serial'}),
                inc.users(),
                inc.stock({as: 'stock'}),
                inc.sizes({stock: true}),
                inc.return_lines({
                    as: 'return',
                    include: [
                        inc.stock({as: 'stock'}),
                        inc.returns()
                    ]
                })
            ],
            notes: [inc.users()],
            orders: [
                inc.users({as: '_for'}),
                inc.users({as: '_by'}),
                inc.order_lines()
            ],
            order_lines: [
                inc.sizes(),
                inc.orders(),
                inc.demand_lines( {as: 'demand_line',  demands: true}),
                inc.receipt_lines({as: 'receipt_line', receipts: true}),
                inc.issue_lines(  {as: 'issue_line',   issues: true})
            ],
            receipts: [
                inc.suppliers({as: 'supplier'}),
                inc.receipt_lines(),
                inc.users()
            ],
            receipt_lines: [
                inc.sizes(),
                inc.receipts(),
                inc.users(),
                inc.stock({as: 'stock'})
            ],
            stock: [inc.locations({as: 'location'})],
            suppliers: [m.accounts, m.files],
            users: [m.ranks]
        },
        attributes = {
            users: ['user_id', 'full_name'],
            settings: ['_name', '_value']
        };
    app.get('/stores/get/issue_lines/:id', isLoggedIn, allowed('', {send: true}),              (req, res) => {
        m.issue_lines.findAll({
            include: [
                inc.users(),
                inc.sizes({stock: true}),
                inc.stock({as: 'stock'}),
                inc.issues({
                    where: {issued_to: req.params.id},
                    required: true
        })]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/order_lines/:id', isLoggedIn, allowed('', {send: true}),              (req, res) => {
        m.order_lines.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.orders({
                    where: {ordered_for: req.params.id},
                    required: true
        })]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/requests',        isLoggedIn, allowed('', {allow: true, send: true}), (req, res) => {
        if (!allowed) req.query.requested_for = req.user.user_id;
        m.requests.findAll({
            where: req.query,
            include: [
                inc.request_lines(),
                inc.users({as: '_for'}),
                inc.users({as: '_by'})
        ]})
        .then(requests => res.send({result: true, requests: requests}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/sizes',           isLoggedIn, allowed('', {send: true}),              (req, res) => {
        m.sizes.findAll({
            where: req.query,
            include: [
                inc.items(),
                inc.stock(),
                inc.serials(),
                inc.nsns()
        ]})
        .then(sizes => {
            sizes.forEach(size => size.dataValues.locationStock = utils.summer(size.stocks));
            res.send({result: true, sizes: sizes})
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/count/:table',        isLoggedIn, allowed('', {send: true}),              (req, res) => {
        m[req.params.table].count({where: req.query})
        .then(count => res.send({result: true, count: count}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/:table',          isLoggedIn, allowed('', {send: true}),              (req, res) => {
        m[req.params.table].findAll({
            where:      req.query,
            include:    includes[req.params.table]   || [],
            attributes: attributes[req.params.table] || {exclude: ['createdAt', 'updatedAt']}
        })
        .then(results => {
            let _return = {result: true};
            _return[req.params.table] = results;
            res.send(_return)
        })
        .catch(err => res.error.send(err, res));
    });
};