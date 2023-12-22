module.exports = (passport, m) => {
    let local = require('passport-local').Strategy;
    let { scryptSync } = require("crypto");
        
    passport.serializeUser((user, done) => done(null, user));

    passport.deserializeUser(function (user, done) {
        m.users.findOne({
            where:      {user_id: user.user_id},
            include:    [{model: m.ranks, attributes: ['rank']}],
            attributes: ['user_id', 'reset', 'full_name']
        })
        .then(_user => {
            _user.dataValues.site_id = user.site_id
            done(null, _user.dataValues);
        })
        .catch(err => {
            console.error(err);
            done(null, {user_id: user.user_id});
        });
    });

    passport.use(new local(
        {
            usernameField: 'login_id',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, login_id, password, done) => {
            m.users.findOne({
                where:      {login_id: login_id.toLowerCase()},
                attributes: ['user_id', 'password', 'salt'],
                include:    [m.sites]
            })
            .then(user => {
                if (!user) {
                    req.flash('danger', 'Invalid username or password!');
                    done(null, false, {message: 'Invalid username or password!'});
                    
                } else if (scryptSync(password, user.salt, 128).toString('hex') !== user.password) {
                    req.flash('danger', 'Invalid username or password!');
                    done(null, false, {message: 'Invalid username or password!'});
                    
                } else {
                    let site_id;
                    if (user.sites && user.sites.length > 0) {
                        site_id = user.sites[0].site_id;
                        user.sites.forEach(site => {
                            if (site.is_default) {
                                site_id = site.site_id;
                            };
                        });

                    } else {
                        site_id = `user: ${user.user_id}`;

                    };
                    user.update({last_login: Date.now()})
                    .then(result => done(null, {user_id: user.user_id, site_id: site_id}))
                    .catch(err => done(null, false, {message: `Error setting last login: ${err.message}`}));
                    
                };
            })
            .catch(err => {
                console.error(err);
                req.flash('danger', 'Something went wrong with your signin!');
                done(null, false, {message: 'Something went wrong with your signin!'});
            });
        }
    ));
};