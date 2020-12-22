module.exports = (app, allowed, inc, loggedIn, m) => {
    app.get('/stores/get/adjusts', loggedIn, allowed('access_adjusts', {send: true}), (req, res) => {
        m.adjusts.findAll({
            where:   req.query,
            include: [
                inc.users(), 
                inc.stock({as: 'stock'})
            ]
        })
        .then(adjusts => res.send({result: true, adjusts: adjusts}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/adjusts',    loggedIn, allowed('adjust_add',     {send: true}), (req, res) => {
        if (req.body.adjust.stock_id && req.body.adjust._qty && req.body.adjust._type) {
            m.stock.findOne({
                where: {stock_id: req.body.adjust.stock_id},
                attributes: ['stock_id', 'size_id', '_qty']
            })
            .then(stock => {
                if (stock) {
                    req.body.adjust.user_id = req.user.user_id;
                    req.body.adjust.size_id = stock.size_id;
                    let action = null;
                    if (req.body.adjust._type === 'Count') {
                        req.body.adjust._variance = Number(req.body.adjust._qty) - Number(stock._qty);
                        action = stock.update({_qty: req.body.adjust._qty});
                    } else if (req.body.adjust._type === 'Scrap') {
                        req.body.adjust._variance = 0 - req.body.adjust._qty;
                        action = stock.decrement('_qty', {by: req.body.adjust._qty});
                    };
                    if (action) {
                        return action
                        .then(result => {
                            return m.adjusts.create(req.body.adjust)
                            .then(adjust => res.send({result: true, message: 'Adjustment added'}))
                            .catch(err => res.error.send(err, res));
                        })
                        .catch(err => res.error.send(err, res));
                    } else res.send({result: false, message: 'Could not set adjustment action'});
                } else res.send({result: false, message: 'Stock not found'});
            })
            .catch(err => res.error.send(err, res));
        } else res.send({result: false, message: 'Not all required details submitted'}); 
    });
};