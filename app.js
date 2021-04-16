var express  = require('express'),
    app      = express(),
    passport = require('passport'),
    session  = require('express-session'),
    flash    = require('connect-flash'),
    bb       = require('express-busboy'),
    memStore = require('memorystore')(session);
console.log('Setting Environment Variables');
require('dotenv').config();
if (!process.env.NODE_ENV) {
    console.log(`No environment set.... setting: ${process.env.NODE_ENV}`);
    process.env.NODE_ENV = 'development';
};
console.log(`Environment: ${process.env.NODE_ENV}`);
let port_check = require(`${process.env.ROOT}/fn/port_check`);
port_check()
.then(port => {
    console.log('Models:');
    let m = {};
    m = require(`${process.env.ROOT}/db/models`);

    console.log('   Loaded');
    require(`${process.env.ROOT}/db/associations`)(m);
    console.log('   Tables associated');

    console.log('Busboy:');
    bb.extend(app, {
        arrayLimit: 200,
        upload: true,
        path: `${process.env.ROOT}/public/uploads`,
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
    require('./config/passport.js')(passport, m);
    console.log('   Setup');

    console.log('Flash:');
    app.use(flash());
    console.log('   Setup');
    console.log('Middleware:');
    app.use(require(`${process.env.ROOT}/middleware/variables.js`)());
    console.log('   Loaded');

    console.log('Engine:');
    app.set('view engine', 'ejs');
    console.log('   Set');

    console.log('Public folder:');
    app.use(express.static(`${__dirname}/public`));
    console.log('   Set');

    console.log('Routes:');
    require('./routes')(app, m);
    console.log('   Loaded');
    app.listen(port, err => {
        if (err) console.log(err);
        else console.log(`Server listening on port: ${port}`);
    });
})
.catch(err => console.log(err));