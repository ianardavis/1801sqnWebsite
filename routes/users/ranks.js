module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/ranks', li,    (req, res) => {
        m.ranks.findAll({where: req.query})
        .then(ranks => res.send({success: true,  result: ranks}))
        .catch(err =>  send_error(res, err));
    });
};