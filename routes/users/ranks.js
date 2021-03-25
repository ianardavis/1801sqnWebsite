module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/ranks',    (req, res) => {
        m.ranks.findAll({where: req.query})
        .then(ranks => res.send({success: true,  result: ranks}))
        .catch(err =>  res.send({success: false, message: `Error getting ranks: ${err.message}`}));
    });
};