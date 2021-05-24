module.exports = (app, fn) => {
    app.get("/",                (req, res) => res.render("index"));
    app.get("/resources",       (req, res) => res.render("resources"));
};