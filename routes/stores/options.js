const   mw = {},
        fn = {};

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    //new option
    app.post('/stores/options', mw.isLoggedIn, (req, res) => {
        fn.allowed(req.query.c + '_add', true, req, res, allowed => {
            fn.create(
                m[req.query.c],
                req.body.record
            )
            .then(result => {
                req.flash('success', 'Option added');
                res.redirect('/stores/settings');
            })
            .catch(err => {
                fn.error(err, '/stores/settings', req, res);
            });
        });
    });
    
    app.put('/stores/options', mw.isLoggedIn, (req, res) => {
        fn.allowed(req.query.c + '_edit', true, req, res, allowed => {
            if (req.body.where && req.body.where !== "") {
                try {
                    var where = JSON.parse(req.body.where);
                    fn.update(
                        m[req.query.c],
                        req.body.record,
                        where
                    )
                    .then(result => {
                        req.flash('success', 'Option edited');
                        res.redirect('/stores/settings');
                    })
                    .catch(err => {
                        fn.error(err, '/stores/settings', req, res);
                    });
                } catch(err) {
                    fn.error(err, '/stores/settings', req, res);
                };
            } else {
                fn.error(new Error('No valid where statement for edit'), '/stores/settings', req, res);
            };
        });
    });
    
    //delete
    app.delete('/stores/options', mw.isLoggedIn, (req, res) => {
        fn.allowed(req.query.c + '_delete', true, req, res, allowed => {
            var check_table;
            if (req.query.c === 'categories') {
                check_table = m.groups;
            } else if (req.query.c === 'groups') {
                check_table = m.types;
            } else if (req.query.c === 'types') {
                check_table = m.subtypes;
            };
            if (req.query.c !== 'subtypes') {
                fn.getOne(
                    check_table,
                    JSON.parse(req.body.where)
                )
                .then(result => {
                    req.flash('danger', 'Can not delete option whilst it has sub options');
                    res.redirect('/stores/settings');
                })
                .catch(err => {
                    deleteOption(req, res);
                })
            } else {
                deleteOption(req, res);
            };
        });
    });
    function deleteOption(req, res) {
        if (req.body.where && req.body.where !== "") {
            try {
                var where = JSON.parse(req.body.where);
                fn.delete(
                    m[req.query.c],
                    where
                )
                .then(result => {
                    req.flash('success', 'Option deleted');
                    res.redirect('/stores/settings');
                })
                .catch(err => {
                    fn.error(err, '/stores/settings', req, res);
                });
            } catch(err) {
                fn.error(err, '/stores/settings', req, res);
            }
        } else {
            fn.error(new Error('No valid where statement for delete'), '/stores/settings', req, res);
        };
    };
};