module.exports = (passport, m) => {
    var local  = require('passport-local').Strategy,
        { scryptSync, randomBytes } = require("crypto");
    passport.serializeUser((user, done) => done(null, user._login_id));

    passport.deserializeUser((_login_id, done) => {
        m.users.findOne({
            where: {_login_id: _login_id},
            attributes: ['_login_id', 'user_id', '_reset']
        })
        .then(user => {
            if (user) {
                done(null, user.get());
                return null;
            } else {
                console.log(err);
                done(err, null);
                return null;
            };
        })
        .catch(err => {
            console.log(err);
            done(err, null);
            return null;
        });
    });

    passport.use('local-signin', new local(
        {
            usernameField: '_login_id',
            passwordField: '_password',
            passReqToCallback: true
        },(req, _login_id, _password, done) => {
            m.users.findOne({
                where: {_login_id: _login_id},
                include: [{
                    model: m.permissions,
                    where: {_permission: 'account_enabled'},
                    required: false
                }],
                attributes: ['_login_id', 'user_id', '_reset', '_password', '_salt']
            })
            .then(user => {
                // console.log(scryptSync(_password, user._salt, 128).toString('hex'));
                if (!user) {
                    req.flash('danger', 'Invalid username or password!');
                    return done(
                        null, 
                        false, 
                        {message: 'Invalid username or password!'}
                    );
                } else if (scryptSync(_password, user._salt, 128).toString('hex') !== user._password) {
                    req.flash('danger', 'Invalid username or password!');
                    return done(
                        null, 
                        false, 
                        {message: 'Invalid username or password!'}
                    );
                } else if (!user.permissions || user.permissions.length === 0) {
                    req.flash('danger', 'Your account is disabled!')
                    return done(
                        null, 
                        false, 
                        {message: 'Your account is disabled!'}
                    );
                } else {
                    delete user._password;
                    delete user._salt;
                    m.users.update({_last_login: Date.now()}, {where: {user_id: user.user_id}})
                    .then(result => {
                        console.log(user.get());
                        return done(null, user.get());
                    })
                    .catch(err => {
                        return done(
                            null, 
                            false, 
                            {message: 'Error setting last login'}
                        );
                    });
                };
            })
            .catch(err => {
                console.log(err);
                req.flash('danger', 'Something went wrong with your signin!')
                return done(null, false, {message: 'Something went wrong with your signin!'});
            });
        }
    ));
};