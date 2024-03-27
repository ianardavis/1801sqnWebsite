module.exports = function ( m, fn ) {
    const default_attributes = ['user_id', 'full_name', 'first_name', 'surname', 'status_id', 'rank_id'];
    fn.users.find = function ( where, attributes = default_attributes ) {
        return new Promise( ( resolve, reject ) => {
            m.users.findOne({
                where: where,
                include: [ m.ranks, m.statuses ],
                attributes: attributes
            })
            .then( fn.rejectIfNull )
            .then( resolve )
            .catch( reject );
        });
    };
    fn.users.findAll = function ( query, site_id, options = {} ) {
        return new Promise( ( resolve, reject ) => {
            let include = [
                m.ranks,
                options.status_include || m.statuses
            ];
            if ( site_id ) include.push({
                model: m.sites,
                where: { site_id: site_id },
                required: true
            })
            m.users.findAndCountAll({
                where:      query.where,
                include:    include,
                attributes: options.attributes || default_attributes.concat(options.extra_attributes || []),
                ...fn.pagination( query )
            })
            .then(resolve)
            .catch( reject );
        });
    };
    fn.users.create = function (user, site_id) {
        return new Promise( ( resolve, reject ) => {
            if (
                (user.service_number) &&
                (user.first_name)     &&
                (user.surname)        &&
                (user.rank_id)        &&
                (user.status_id)      &&
                (user.login_id)
            ) {
                const password = fn.users.password.generate();
                m.users.findOrCreate({
                    where: {service_number: user.service_number},
                    defaults: {
                        first_name: user.first_name,
                        surname:    user.surname,
                        rank_id:    user.rank_id,
                        status_id:  user.status_id,
                        login_id:   user.login_id.toLowerCase(),
                        reset:      true,
                        ...fn.users.password.encrypt(password.plain)
                    }
                })
                .then(([user, created]) => {
                    if (!created) {
                        reject(new Error('There is already a user with this service #'));

                    } else {
                        fn.sites.addUser(user.user_id, site_id)
                        .then(added => {
                            resolve(password.readable);
                        })
                        .catch(new Error('User created, but not added to site'));
                    
                    };
                })
            } else {
                reject(new Error('Not all required information has been submitted'));
            
            };
        });
    };
    fn.users.edit = function (user_id, details) {
        if (details) {
            function updateUser(user) {
                return new Promise( ( resolve, reject ) => {
                    ['user_id', 'full_name', 'salt', 'password', 'last_login', 'createdAt', 'updatedAt', 'reset'].forEach(e => {
                        if (details[e]) delete details[e];
                    });
                    user.update( details )
                    .then( fn.checkresult )
                    .then(resolve)
                    .catch( reject );
                });
            };
            return new Promise( ( resolve, reject ) => {
                fn.users.find(
                    {user_id: user_id},
                    ['user_id', 'login_id', 'first_name', 'surname', 'status_id', 'rank_id', 'service_number']
                )
                .then(updateUser)
                .then(resolve)
                .catch( reject );
            });

        } else {
            return Promise.reject(new Error('No details submitted'));
        
        };
    };
    fn.users.setDefaultSite = function (user_id, site_id) {
        return new Promise( ( resolve, reject ) => {
            m.site_users.findOne({where: {
                user_id: user_id,
                site_id: site_id
            }})
            .then(site_user => {
                if (!site_user) {
                    reject(new Error('User is not on this site!'));

                } else {
                    m.site_users.update({ is_default: false }, { where: { user_id: user_id } })
                    .then(result => {
                        site_user.update({ is_default: true })
                        .then(result => {
                            if (result) {
                                resolve(true);
    
                            } else {
                                reject(new Error('record not updated'));
    
                            };
                        })
                        .catch( reject );
                    })
                    .catch( reject );
                };
            })
            .catch( reject );
        });
    };
    fn.users.toggleReset = function (user_id) {
        return new Promise( ( resolve, reject ) => {
            fn.users.find({user_id: user_id}, ["user_id", "reset"])
            .then(user => {
                user.update( { reset: !user.reset } )
                .then( fn.checkResult )
                .then(resolve)
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.users.delete = function (user_id, user_id_self) {
        return new Promise( ( resolve, reject ) => {
            fn.users.find({user_id: user_id})
            .then(user => {
                if (user.user_id === user_id_self) {
                    reject(new Error('You can not delete your own account'));

                } else {
                    Promise.all([
                        m.permissions.destroy({where: {user_id: user.user_id}}),
                        user.destroy()
                    ])
                    .then(([result1, result2]) => resolve(true))
                    .catch( reject );

                };
            })
            .catch(err => fn.sendError( res, err ));
        });
    };
};
