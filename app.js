var express  = require('express'),
    app      = express(),
    passport = require('passport'),
    session  = require('express-session'),
    bb       = require('express-busboy'),
    flash    = require('connect-flash'),
    memStore = require('memorystore')(session);
console.log('Setting Environment Variables');
require('dotenv').config();
if (!process.env.NODE_ENV) {
    console.log(`No environment set.... setting: ${process.env.NODE_ENV}`);
    process.env.NODE_ENV = 'development';
};
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log('   Set')
let port_check = require(`${process.env.ROOT}/fn/utils/port_check`)
port_check()
.then(port => {
    console.log('Models:');
    let m = {};
    m.stores  = require(`${process.env.ROOT}/db/stores/models`);
    m.canteen = require(`${process.env.ROOT}/db/canteen/models`);
    m.users   = require(`${process.env.ROOT}/db/users/models`);
    console.log('   Loaded');
    console.log('Associating tables:');
    require(`${process.env.ROOT}/db/stores/associations.js`) (m.stores);
    require(`${process.env.ROOT}/db/canteen/associations.js`)(m.canteen);
    require(`${process.env.ROOT}/db/users/associations.js`)  (m);
    console.log('   Done');

    console.log('Busboy:');
    bb.extend(app, {
        arrayLimit: 200,
        upload: true,
        path: process.env.ROOT + '/public/uploads',
        allowedPath: /./
    });
    console.log('   Loaded');

    console.log('Session:');
    app.use(
        session({
            secret: '1801 (Alnwick) Squadron Air Training Corps',
            store:  new memStore({checkPeriod: 86400000}),
            resave: true,
            saveUninitialized: true
        })
    );
    console.log('   Setup');

    console.log('Passport:');
    app.use(passport.initialize());
    app.use(passport.session());
    require('./config/passport.js')(passport, m.users);
    console.log('   Setup');

    console.log('Flash:');
    app.use(flash());
    console.log('   Setup');
    console.log('Middleware:');
    app.use(require(`${process.env.ROOT}/middleware/variables.js`)());
    app.use(require(`${process.env.ROOT}/middleware/loggedIn.js`)());
    console.log('   Loaded');

    console.log('Engine:');
    app.set('view engine', 'ejs');
    console.log('   Set');

    console.log('Public folder:');
    app.use(express.static(__dirname + '/public'));
    console.log('   Set');

    console.log('Routes:');
    require('./routes/common') (app, m);
    require('./routes/stores') (app, m);
    require('./routes/canteen')(app, m);
    require('./routes/users')  (app, m);
    require('./routes/site')   (app);
    console.log('   Loaded');
    app.listen(port, err => {
        if (err) console.log(err);
        else console.log(`Server listening on port: ${port}`);
    });
})
.catch(err => console.log(err));