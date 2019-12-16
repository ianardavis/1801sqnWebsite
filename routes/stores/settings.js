const   mw = {},
        fn = {};

//root
module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
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
    app.get('/stores/settings', mw.isLoggedIn, allowed('access_settings', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOptions(options(), req, classes => {
            fn.getAll(
                m.sizes
            )
            .then(sizes => {
                res.render('stores/settings/show',{
                    classes: classes,
                    sizes:   sizes
                });
            })
            .catch(err => {
                fn.error(err, '/stores', req, res);
            })
        });
    });
};