module.exports = (passport, m) => {
    var local  = require('passport-local').Strategy,
        { scryptSync } = require("crypto");
    passport.serializeUser((user, done) => done(null, user._login_id));

    passport.deserializeUser((_login_id, done) => {
        m.users.findOne({
            where: {_login_id: _login_id},
            include: [{model: m.ranks, attributes: ['_rank']}],
            attributes: ['_login_id', 'user_id', '_reset', 'full_name']
        })
        .then(user => {
            if (user) {
                return done(null, user.get());
            } else {
                console.log(new Error('User not found'));
                return done(new Error('User not found'), null);
            };
        })
        .catch(err => {
            console.log(err);
            return done(err, null);
        });
    });

    passport.use('local-signin', new local(
        {
            usernameField: '_login_id',
            passwordField: '_password',
            passReqToCallback: true
        },
        (req, _login_id, _password, done) => {
            return m.users.findOne({
                where: {_login_id: _login_id},
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
                } else {
                    delete user.dataValues._password;
                    delete user.dataValues._salt;
                    
                    return m.users.update({_last_login: Date.now()},{where: {user_id: user.user_id}})
                    .then(function(result) {
                        return done(null, user.get())})
                    .catch(err => {
                        return done(
                            null, 
                            false, 
                            {message: `Error setting last login: ${err.message}`}
                        );
                    });
                };
            })
            .catch(err => {
                console.log(err);
                req.flash('danger', 'Something went wrong with your signin!');
                return done(null, false, {message: 'Something went wrong with your signin!'});
            });
        }
    ));
};