const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require('../../db/functions'),
        cn = require("../../db/constructors");

//root
module.exports = (app, m) => {
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
    app.get('/stores/settings', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_settings', true, req, res, allowed => {
            fn.getOptions(options(), req, classes => {
                fn.getAll(m.sizes, req, false, sizes => {
                    res.render('stores/settings/show',{
                        classes: classes,
                        sizes:   sizes
                    });
                })
            });
        });
    });
};