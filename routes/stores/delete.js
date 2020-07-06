const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db'), settings = {};
    require(process.env.ROOT + '/fn/settings')(m.settings, settings);
    app.delete('/stores/accounts/:id',      isLoggedIn, allowed('account_delete',      {send: true}), (req, res) => {
        db.destroy({
            table: m.accounts,
            where: {account_id: req.params.id}
        })
        .then(result => {
            db.update({
                table: m.suppliers,
                where: {supplier_id: req.body.supplier_id},
                record: {account_id: null}
            })
            .then(result => res.send({result: true, message: 'Account deleted and supplier updated'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/demands/:id',       isLoggedIn, allowed('demand_delete',       {send: true}), (req, res) => {
        db.destroy({
            table: m.demand_lines,
            where: {demand_id: req.params.id}
        })
        .then(result => {
            db.destroy({
                table: m.demands,
                where: {demand_id: req.params.id}
            })
            .then(result => res.send({result: true, message: 'Demand deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/files/:id',         isLoggedIn, allowed('file_delete',         {send: true}), (req, res) => {
        db.findOne({
            table: m.files,
            where: {file_id: req.params.id}
        })
        .then(file => {
            db.destroy({
                table: m.files,
                where: {file_id: req.params.id}
            })
            .then(result => {
                db.update({
                    table: m.suppliers,
                    where: {file_id: req.params.id},
                    record: {file_id: null}
                })
                .then(result => {
                    try {
                        fs.unlinkSync(process.env.ROOT + '/public/res/files/' + file._path)
                        res.send({result: true, message: 'File deleted'});
                    } catch(err) {
                        res.error.send(err, res);
                    };
                })
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/issues/:id',        isLoggedIn, allowed('issue_delete',        {send: true}), (req, res) => {
        db.findOne({
            table: m.issues,
            where: {issue_id: req.params.id},
            include: [inc.issue_lines()]
        })
        .then(issue => {
            if (issue._complete || issue._closed) res.error.send('Completed/closed issues can not be deleted');
            else {
                if (issue.lines.filter(e => e.return_line_id).length === 0) {
                    db.destroy({
                        table: m.issue_lines,
                        where: {issue_id: req.params.id}
                    })
                    .then(result => {
                        db.destroy({
                            table: m.issues,
                            where: {issue_id: req.params.id}
                        })
                        .then(result => res.send({result: true, message: 'Issue deleted'}))
                        .catch(err => res.error.send(err, res));
                    })
                    .catch(err => res.error.send(err, res));
                } else res.error.send('Returned issue lines can not be deleted');
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/items/:id',         isLoggedIn, allowed('item_delete',         {send: true}), (req, res) => {
        m.sizes.findOne({where: {item_id: req.params.id}})
        .then(sizes => {
            if (!sizes) {
                db.destroy({
                    table: m.items,
                    where: {item_id: req.params.id}
                })
                .then(result => res.send({result: true, message: 'Item deleted'}))
                .catch(err => res.error.send(err, res));
            } else res.error.send('Cannot delete item while it has sizes assigned', res);
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/notes/:id',         isLoggedIn, allowed('note_delete',         {send: true}), (req, res) => {
        db.destroy({
            table: m.notes,
            where: {
                note_id: req.params.id,
                _system: 0
            }
        })
        .then(result => res.send({result: true, message: 'Note deleted'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/nsns/:id',          isLoggedIn, allowed('nsn_delete',          {send: true}), (req, res) => {
        db.destroy({
            table: m.nsns,
            where: {nsn_id: req.params.id}
        })
        .then(result => {
            m.sizes.update(
                {nsn_id: null},
                {where: {nsn_id: req.params.id}}
            )
            .then(result => res.send({result: true, message: 'NSN deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/orders/:id',        isLoggedIn, allowed('order_delete',        {send: true}), (req, res) => {
        m.order_lines.destroy({where: {order_id: req.params.id}})
        .then(result => {
            db.destroy({
                table: m.orders,
                where: {order_id: req.params.id}
            })
            .then(result => res.send({result: true, message: 'Order deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/receipts/:id',      isLoggedIn, allowed('receipt_delete',      {send: true}), (req, res) => {
        m.receipt_lines.destroy({where: {receipt_id: req.params.id}})
        .then(result => {
            db.destroy({
                table: m.receipts,
                where: {receipt_id: req.params.id}
            })
            .then(result => res.send({result: true, message: 'Receipt deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/requests/:id',      isLoggedIn, allowed('request_delete',      {send: true}), (req, res) => {
        m.request_lines.destroy({where: {request_id: req.params.id}})
        .then(result => {
            db.destroy({
                table: m.requests,
                where: {request_id: req.params.id}
            })
            .then(result => res.send({result: true, message: 'Request deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/sizes/:id',         isLoggedIn, allowed('size_delete',         {send: true}), (req, res) => {
        m.stock.findOne({where: {size_id: req.params.id}})
        .then(stock => {
            if (stock) res.error.send('Cannot delete a size whilst it has stock', res)
            else {
                m.nsns.findOne({where: {size_id: req.params.id}})
                .then(nsn => {
                    if (nsn) res.error.send('Cannot delete a size whilst it has NSNs assigned', res)
                    else {
                        db.destroy({
                            table: m.sizes,
                            where: {size_id: req.params.id}
                        })
                        .then(result => res.send({result: true, message: 'Size deleted'}))
                        .catch(err => res.error.send(err, res));
                    };
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/stock/:id',         isLoggedIn, allowed('stock_delete',        {send: true}), (req, res) => {
        db.findOne({
            table: m.stock,
            where: {stock_id: req.params.id}
        })
        .then(stock => {
            if (stock._qty === 0) {
                db.destroy({
                    table: m.stock,
                    where: {stock_id: req.params.id}
                })
                .then(result => {
                    if (result) res.send({result: true, message: 'Stock deleted'})
                    else res.error.send('Stock NOT deleted', res);
                })
                .catch(err => res.error.send(err, res));
            } else res.error.send('Cannot delete whilst stock is not 0', res)
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/suppliers/:id',     isLoggedIn, allowed('supplier_delete',     {send: true}), (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2') {
            db.destroy({
                table: m.suppliers,
                where: {supplier_id: req.params.id}
            })
            .then(result => {
                settings.get({
                    name: 'default_supplier',
                    default: -1
                })
                .then(defaultSupplier => {
                    if (Number(defaultSupplier) === Number(req.params.id)) {
                        settings.edit({
                            name: 'default_supplier',
                            value: -1
                        })
                        .then(result => {
                            if (result) res.send({result: true, message: 'Default supplier deleted, settings updated'})
                            else res.send({result: false, message: 'Default supplier deleted, settings NOT updated'});
                        })
                        .catch(err => res.error.send(err.message, res));
                    } else res.send({result: true, message: 'Supplier deleted'});
                })
                .catch(err => res.error.send(err.message, res));
            })
            .catch(err => res.error.send(err.message, res));
        } else res.error.send('This supplier can not be deleted!', res);
    });
    app.delete('/stores/users/:id',         isLoggedIn, allowed('user_delete',         {send: true}), (req, res) => {
        if (Number(req.user.user_id) !== Number(req.params.id)) {
            m.permissions.destroy({where: {user_id: req.params.id}})
            .then(result => {
                db.destroy({
                    table: m.users,
                    where: {user_id: req.params.id}
                })
                .then(result => res.send({result: true, message: 'User/Permissions deleted'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        } else res.send_error('You can not delete your own account', res);       
    });

    app.delete('/stores/issue_lines/:id',   isLoggedIn, allowed('issue_line_delete',   {send: true}), (req, res) => { //
        db.findOne({
            table: m.issue_lines,
            where: {line_id: req.params.id}
        })
        .then(line => {
            if (line.return_line_id) res.error.send('Returned issue lines can not be deleted')
            else {
                db.destroy({
                    table: m.issue_lines,
                    where: {line_id: req.params.id}
                })
                .then(result => res.send({result: true, message: 'Line deleted'}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/order_lines/:id',   isLoggedIn, allowed('order_line_delete',   {send: true}), (req, res) => { //
        db.findOne({
            table: m.order_lines,
            where: {line_id: req.params.id}
        })
        .then(line => {
            db.update({
                table: m.order_lines,
                where: {line_id: req.params.id},
                record: {_status: 'Cancelled'}
            })
            .then(result => {
                m.notes.create({
                    _table:  'orders',
                    _note:   'Line ' + req.params.id + ' cancelled',
                    _id:     line.order_id,
                    user_id: req.user.user_id,
                    system:  true
                })
                .then(result => res.send({result: true, message: 'Line cancelled'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/demand_lines/:id',  isLoggedIn, allowed('demand_line_delete',  {send: true}), (req, res) => { //
        db.findOne({
            table: m.demand_lines,
            where: {line_id: req.params.id}
        })
        .then(line => {
            db.update({
                table: m.demand_lines,
                where: {line_id: req.params.id},
                record: {_status: 'Cancelled'}
            })
            .then(result => {
                m.notes.create({
                    _table:  'demands',
                    _note:   'Line ' + req.params.id + ' cancelled',
                    _id:     line.demand_id,
                    user_id: req.user.user_id,
                    system:  1
                })
                .then(result => res.send({result: true, message: 'Line cancelled'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });

    app.delete('/stores/request_lines/:id', isLoggedIn, allowed('request_line_delete', {send: true}), (req, res) => { //////
        db.destroy({
            table: m.request_lines,
            where: {line_id: req.params.id}
        })
        .then(result => res.send({result: true, message: 'Line deleted'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/serials/:id',       isLoggedIn, allowed('serial_delete',       {send: true}), (req, res) => { //////
        db.destroy({
            table: m.serials,
            where: {serial_id: req.params.id}
        })
        .then(result => res.send({result: true, message: 'Serial deleted'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/:table/:id',        isLoggedIn, allowed('',                    {send: true}), (req, res) => { //////
        db.destroy({
            table: m[req.params.table],
            where: {serial_id: req.params.id}
        })
        .then(result => res.send({result: true, message: 'Serial deleted'}))
        .catch(err => res.error.send(err, res));
    });
};