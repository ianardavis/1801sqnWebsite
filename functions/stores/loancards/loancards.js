module.exports = function ( m, fn ) {
    fn.loancards.find = function (where, include = []) {
        return fn.find(
            m.loancards,
            where,
            [
                fn.inc.users.user(),
                fn.inc.users.user({as: 'user_loancard'})
            ].concat(include)
        );
    };
    fn.loancards.findAll = function (allowed, query, user_id) {
        function issuerAllowed(user_id_loancard, user_id) {
            return new Promise(resolve => {
                if (allowed) {
                    if (user_id_loancard && user_id_loancard !== '') {
                        resolve({where: {user_id: user_id_loancard}});
    
                    } else {
                        resolve({});
    
                    };
    
                } else {
                    if (!user_id_loancard || user_id_loancard === user_id) {
                        resolve({where: {user_id: user_id}});
    
                    } else {
                        reject(new Error('Permission denied'));
    
                    };
    
                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            if (!query.where) query.where = {};
            issuerAllowed(query.where.user_id_loancard, user_id)
            .then(user_filter => {
                if (!query.offset || isNaN(query.offset)) query.offset = 0;
                if ( query.limit  && isNaN(query.limit))  delete query.limit;

                const include = [
                    {
                        model: m.loancard_lines,
                        as:    'lines',
                        where: {status: {[fn.op.ne]: 0}},
                        required: false
                    },
                    fn.inc.users.user(),
                    fn.inc.users.user({as: 'user_loancard', ...user_filter})
                ];
                m.loancards.findAndCountAll({
                    where: fn.buildQuery(query),
                    include: include,
                    ...fn.pagination( query )
                })
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.loancards.edit = function (site_id, loancard_id, details) {
        return new Promise( ( resolve, reject ) => {
            fn.loancards.find({loancard_id: loancard_id, site_id: site_id})
            .then(loancard => {
                fn.update(loancard, details)
                .then(result => resolve(true))
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.loancards.count = function (site_id, where) {
        where.site_id = site_id;
        return m.loancards.count({where: where})
    };
    
    fn.loancards.cancel = function (site_id, loancard_id, user_id) {
        function check(loancard_id) {
            return new Promise( ( resolve, reject ) => {
                fn.loancards.find(
                    {loancard_id: loancard_id, site_id: site_id},
                    [{
                        model: m.loancard_lines,
                        as: 'lines',
                        where: {status: {[fn.op.or]: [1, 2, 3]}},
                        required: false
                    }]
                )
                .then(loancard => {
                    if (loancard.status === 0) {
                        reject(new Error('This loancard has already been cancelled'));
    
                    } else if (loancard.status === 1) {
                        if (loancard.lines && loancard.lines > 0) {
                            reject(new Error('You can not cancel a loancard with uncancelled lines'));
    
                        } else {
                            resolve(loancard);
    
                        };
                    } else if (loancard.status === 2) {
                        reject(new Error('This loancard has already been completed'));
    
                    } else if (loancard.status === 3) {
                        reject(new Error('This loancard has already been closed'));
    
                    } else {
                        reject(new Error('Unknown loancard status'));
                    };
                })
                .then(reject);
            });
        };
        return new Promise( ( resolve, reject ) => {
            check(loancard_id)
            .then(loancard => {
                fn.update(loancard, {status: 0})
                .then(result => {
                    fn.actions.create([
                        'LOANCARD | CANCELLED',
                        user_id,
                        [{_table: 'loancards', id: loancard.loancard_id}]
                    ])
                    .then(action => resolve(true));
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.loancards.create = function (site_id, user_id_loancard, user_id) {
        return new Promise( ( resolve, reject ) => {
            m.loancards.findOrCreate({
                where: {
                    site_id: site_id,
                    user_id_loancard: user_id_loancard,
                    status: 1
                },
                defaults: {user_id: user_id}
            })
            .then(([loancard, created]) => resolve(loancard.loancard_id))
            .catch( reject );
        });
    };

    fn.loancards.complete = function (site_id, loancard_id, user_id, date_due) {
        function check(loancard_id) {
            return new Promise( ( resolve, reject ) => {
                fn.loancards.find( 
                    {loancard_id: loancard_id, site_id: site_id},
                    [{
                        model: m.loancard_lines,
                        as: 'lines',
                        where: {status: {[fn.op.or]: [1, 2]}},
                        required: false
                    }]
                ) 
                .then(loancard => {
                    if (loancard.status !== 1) {
                        reject(new Error('Loancard is not in draft'));
    
                    } else if (!loancard.lines || loancard.lines.length === 0) {
                        reject(new Error('No open lines'));
    
                    } else {
                        resolve(loancard);
                        
                    };
                })
                .catch( reject );
            });
        };
        function updateLines(lines) {
            return new Promise( ( resolve, reject ) => {
                let actions = [];
                lines.forEach(line => {
                    actions.push(new Promise( ( resolve, reject ) => {
                        fn.update(line, {status: 2})
                        .then(result => resolve({_table: 'loancard_lines', id: line.line_id}))
                        .catch( reject );
                    }));
                });
                Promise.all(actions)
                .then(links => resolve(links))
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            check(loancard_id)
            .then(loancard => {
                updateLines(loancard.lines)
                .then(line_links => {
                    fn.update(
                        loancard,
                        {
                            status:   2,
                            date_due: date_due
                        }
                    )
                    .then(result => {
                        fn.actions.create([
                            'LOANCARD | COMPLETED',
                            user_id,
                            [{_table: 'loancards', id: loancard.loancard_id}].concat(line_links)
                        ])
                        .then(action => resolve([loancard.loancard_id, site_id]));
                    })
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };

    function getFilename(loancard_id, site_id) {
        return new Promise( ( resolve, reject ) => {
            fn.loancards.find({loancard_id: loancard_id, site_id: site_id})
            .then(loancard => {
                if (!loancard.filename) {
                    fn.loancards.pdf.create([site_id, loancard.loancard_id])
                    .then(filename => resolve(filename))
                    .catch( reject );

                } else {
                    resolve(loancard.filename);
                
                };
            })
            .catch( reject );
        });
    };
    fn.loancards.download = function (site_id, loancard_id, res) {
        return new Promise( ( resolve, reject ) => {
            getFilename(loancard_id, site_id)
            .then(filename => {
                fn.fs.download('loancards', filename, res)
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.loancards.close = function (site_id, loancard_id, user_id) {
        function check(loancard_id) {
            return new Promise( ( resolve, reject ) => {
                fn.loancards.find(
                    {loancard_id: loancard_id, site_id: site_id},
                    [{
                        model: m.loancard_lines,
                        as: 'lines',
                        where: {status: {[fn.op.or]: [1, 2]}},
                        required: false
                    }]
                )
                .then(loancard => {
                    if (loancard.lines.length > 0) {
                        reject(new Error('Loancard has open lines'));
    
                    } else {
                        resolve(loancard);
                        
                    };
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            check(loancard_id)
            .then(loancard => {
                fn.update(loancard, {status: 3})
                .then(result => {
                    fn.actions.create([
                        'LOANCARD | CLOSED',
                        user_id,
                        [{_table: 'loancards', id: loancard.loancard_id}]
                    ])
                    .then(action => resolve(true));
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
};