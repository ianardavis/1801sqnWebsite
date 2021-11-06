module.exports = (app, m, fn) => {
    app.get('/get/ranks', fn.loggedIn(), (req, res) => {
        m.ranks.findAll({
            where: JSON.parse(req.query.where),
            ...fn.sort(req.query.sort)
        })
        .then(ranks => res.send({success: true,  result: ranks}))
        .catch(err =>  fn.send_error(res, err));
    });
};