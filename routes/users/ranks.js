module.exports = (app, m, inc, fn) => {
    app.get('/get/ranks', fn.loggedIn(), (req, res) => {
        m.ranks.findAll({where: req.query})
        .then(ranks => res.send({success: true,  result: ranks}))
        .catch(err =>  fn.send_error(res, err));
    });
};