module.exports = (app, fn) => {
    app.get("/",          (req, res) => res.render("site/index"));
    app.get("/resources", (req, res) => res.render("site/resources"));
};