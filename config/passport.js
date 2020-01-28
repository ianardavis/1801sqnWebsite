module.exports = (passport, m) => {
    var bCrypt = require('bcrypt'),
        local  = require('passport-local').Strategy,
        fn     = {};
        require('../functions')(fn, m);

    passport.serializeUser((user, done) => done(null, user._login_id));

    passport.deserializeUser((_login_id, done) => {
        fn.getOne(
            m.users,
            {_login_id: _login_id},
            {include: [], attributes: ['_login_id', 'user_id', '_reset'], nullOK: false}
        )
        .then(user => {
            done(null, user.get());
            return null;
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
            var isValidPassword = (userpass, password) => {return bCrypt.compareSync(password, userpass)};
            fn.getOne(
                m.users,
                {_login_id: _login_id},
                {include: [m.permissions], attributes: ['_login_id', 'user_id', '_reset', '_password'], nullOK: false}
            )
            .then(user => {
                if (!user) {
                    req.flash('danger', 'Invalid username or password!');
                    return done(
                        null, 
                        false, 
                        {message: 'Invalid username or password!'}
                    );
                } else if (!isValidPassword(user._password, _password)) {
                    req.flash('danger', 'Invalid username or password!');
                    console.log(user, _login_id);
                    return done(
                        null, 
                        false, 
                        {message: 'Invalid username or password!'}
                    );
                } else if (!user.permission) {
                    req.flash('danger', 'Permissions not found, contact the system administrator!')
                    return done(
                        null, 
                        false, 
                        {message: 'Permissions not found, contact the system administrator!'}
                    );
                } else if (user.permission.account_enabled === 0) {
                    req.flash('danger', 'Your account is disabled!')
                    return done(
                        null, 
                        false, 
                        {message: 'Your account is disabled!'}
                    );
                } else return done(null, user.get());
            })
            .catch(err => {
                console.log(err);
                req.flash('danger', 'Something went wrong with your signin!')
                return done(null, false, {message: 'Something went wrong with your signin!'});
            });
        }
    ));
};