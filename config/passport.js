module.exports = (passport, user, permissions) => {
    var bCrypt          = require('bcrypt'),
        LocalStrategy   = require('passport-local').Strategy;

    passport.serializeUser((user, done) => {
        done(null, user._login_id);
    });

    passport.deserializeUser((_login_id, done) => {
        user.findOne({
            attributes: [`_login_id`, 'user_id'],
            where: {
                _login_id: _login_id
            }
        }).then((user) => {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            };
            return null;
        }).catch((err) => {
            console.log(err);
            done(user.errors, null);
            return null;
        });
    });

    passport.use('local-signin', new LocalStrategy({
        usernameField: '_login_id',
        passwordField: '_password',
        passReqToCallback: true
    },
        (req, _login_id, _password, done) => {
            var isValidPassword = (userpass, password) => {
                    return bCrypt.compareSync(password, userpass);
                };
            user.findOne({
                attributes: ['user_id', '_login_id', '_password'],
                where: {
                    _login_id: _login_id
                }
            }).then((user) => {
                if (!user) {
                    req.flash('danger', 'Invalid username or password!')
                    return done(null, false, {message: 'Invalid username or password!'}
                    );
                }
                if (!isValidPassword(user._password, _password)) {
                    req.flash('danger', 'Invalid username or password!')
                    return done(null, false, {message: 'Invalid username or password!'}
                    );
                }
                permissions.findOne({
                    attributes: ['account_enabled'],
                    where: {
                        user_id: user.user_id
                    }
                }).then((permission) => {
                    if (!permission) {
                        req.flash('danger', 'Permissions not found, contact the system administrator!')
                        return done(null, false, {message: 'Permissions not found, contact the system administrator!'}
                        );
                    }
                    if (permission.account_enabled === 0) {
                        req.flash('danger', 'Your account is disabled!')
                        return done(null, false, {message: 'Your account is disabled!'}
                        );
                    }
                var userInfo = user.get();
                userInfo.permissions = permission;
                return done(null, userInfo);
                }).catch((err) => {
                    console.log(err);
                    req.flash('danger', 'Something went wrong with your signin!')
                    return done(null, false, {message: 'Something went wrong with your signin!'});
                });
            }).catch((err) => {
                console.log(err);
                req.flash('danger', 'Something went wrong with your signin!')
                return done(null, false, {message: 'Something went wrong with your signin!'});
            });
        }
    ));
};