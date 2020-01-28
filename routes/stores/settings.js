module.exports = (app, allowed, fn, isLoggedIn, m) => {
    function options() {
        return [
            {table: 'categories'}, 
            {table: 'groups', include: m.categories}, 
            {table: 'types', include: m.groups}, 
            {table: 'subtypes', include: m.types}, 
            {table: 'genders'}, 
            {table: 'ranks'}, 
            {table: 'statuses'}
        ]
    };
    app.get('/stores/settings', isLoggedIn, allowed('access_settings'), (req, res) => {
        fn.getAll(m.settings)
        .then(settings => {
            fn.getOptions(options(), req)
            .then(classes => {
                res.render('stores/settings/show', {
                    settings: settings,
                    classes:  classes
                });
            });
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });
};