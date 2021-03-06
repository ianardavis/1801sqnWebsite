module.exports = (app, m, fn) => {
    app.get('/reports',   fn.loggedIn(), fn.permissions.get('access_reports'), (req, res) => res.render('stores/reports/index'));
    app.get('/reports/1', fn.loggedIn(), fn.permissions.get('adjustment_add'), (req, res) => res.render('stores/reports/show/1'));
    app.get('/reports/2', fn.loggedIn(), fn.permissions.get('issue_edit'),     (req, res) => res.render('stores/reports/show/2'));
    app.get('/reports/3', fn.loggedIn(), fn.permissions.get('order_add'),      (req, res) => res.render('stores/reports/show/3'));
    app.get('/reports/4', fn.loggedIn(), fn.permissions.get('access_reports'), (req, res) => res.render('stores/reports/show/4'));
    app.get('/reports/5', fn.loggedIn(), fn.permissions.get('adjustment_add'), (req, res) => res.render('stores/reports/show/5'));
    app.get('/reports/*', fn.loggedIn(), fn.permissions.get('access_reports'), (req, res) => {
        req.flash('danger', 'Invalid report');
        res.redirect('/reports');
    });
};