const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/items',        permissions, allowed('access_items'),              (req, res) => res.render('canteen/items/index'));
    app.get('/canteen/items/:id',    permissions, allowed('access_items'),              (req, res) => res.render('canteen/items/show'));
    
    app.get('/canteen/get/items',    permissions, allowed('access_items'),              (req, res) => {
        m.items.findAll({where: req.query})
        .then(items => res.send({success: true, result: items}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/canteen/get/item',     permissions, allowed('access_items'),              (req, res) => {
        m.items.findOne({where: req.query})
        .then(item => {
            if (item) res.send({success: true,  result: item})
            else      res.send({success: false, message: 'Item not found'})
        })
        .catch(err => res.error.send(err, res));
    });

    app.put('/canteen/items/:id',    permissions, allowed('item_edit',   {send: true}), (req, res) => {
        m.items.findOne({
            where: {item_id: req.params.id},
            attributes: ['item_id']
        })
        .then(item => {
            if (item) {
                item.update(req.body.item)
                .then(result => {
                    if (result) res.send({success: true,  message: 'Item updated'})
                    else        res.send({success: false, message: 'Item not updated'})
                })
                .catch(err => res.error.send(err, res));
            } else res.send({success: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/canteen/items',       permissions, allowed('item_add',    {send: true}), (req, res) => {
        m.items.create(req.body.item)
        .then(item => res.send({success: true, message: `Item added: ${item.item_id}`}))
        .catch(err => res.error.send(err, res));
    });

    app.delete('/canteen/items/:id', permissions, allowed('item_delete', {send: true}), (req, res) => {
        m.items.findOne({
            where: {item_id: req.params.id},
            attributes: ['item_id']
        })
        .then(item => {
            if (item) {
                if (item.item_id > 0) {
                    item.destroy()
                    .then(result => {
                        if (result) res.send({success: true,  message: 'Item deleted'})
                        else        res.send({success: false, message: 'Item not deleted'});
                    })
                    .catch(err => res.error.send(err, res));
                } else res.send({success: false, message: 'This item can not be deleted'});
            } else res.send({success: false, message: 'Item not found'});
        })
        .catch(err => res.error.send(err, res));
    });
};