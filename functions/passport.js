module.exports = (passport, m) => {
    let local  = require('passport-local').Strategy,
        { scryptSync } = require("crypto");
        
    passport.serializeUser((user_id, done) => done(null, user_id));

    passport.deserializeUser(function (user_id, done) {
        m.users.findOne({
            where:      {user_id: user_id},
            include:    [{model: m.ranks, attributes: ['rank']}],
            attributes: ['user_id', 'reset', 'full_name']
        })
        .then(user => done(null, user.dataValues))
        .catch(err => done(null, {user_id: user_id}));
    });

    passport.use(
        new local(
            {
                usernameField: 'login_id',
                passwordField: 'password',
                passReqToCallback: true
            },
            (req, login_id, password, done) => {
                m.users.findOne({
                    where:      {login_id: login_id.toLowerCase()},
                    attributes: ['user_id', 'password', 'salt']
                })
                .then(user => {
                    if (!user) {
                        req.flash('danger', 'Invalid username or password!');
                        done(null, false, {message: 'Invalid username or password!'});
                    } else if (scryptSync(password, user.salt, 128).toString('hex') !== user.password) {
                        req.flash('danger', 'Invalid username or password!');
                        done(null, false, {message: 'Invalid username or password!'});
                    } else {
                        return user.update({last_login: Date.now()})
                        .then(result => done(null, user.user_id))
                        .catch(err => done(null, false, {message: `Error setting last login: ${err.message}`}));
                    };
                })
                .catch(err => {
                    console.log(err);
                    req.flash('danger', 'Something went wrong with your signin!');
                    done(null, false, {message: 'Something went wrong with your signin!'});
                });
            }
    ));
};